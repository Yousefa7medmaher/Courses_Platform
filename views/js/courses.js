// Helper: escape HTML
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  // Generate star rating HTML
  function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
  }

  // Render a single course card with enhanced design
  function renderCourseCard(course) {
    const imgSrc = course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop';
    const title = escapeHTML(course.title || 'Untitled Course');
    const desc = escapeHTML(course.description || 'No description available.');
    const instructor = escapeHTML(course.instructor || 'Unknown Instructor');
    const price = course.price ? `$${course.price}` : 'Free';
    const tags = Array.isArray(course.tags) ? course.tags : [];
    const duration = course.duration ? `${course.duration} hrs` : '';
    const level = course.level ? escapeHTML(course.level) : '';
    const students = course.students ? course.students.toLocaleString() : '';
    const rating = course.rating || 0;

    const levelIcon = {
      'Beginner': 'fa-seedling',
      'Intermediate': 'fa-star-half-alt',
      'Advanced': 'fa-crown'
    }[level] || 'fa-bookmark';

    const levelClass = {
      'Beginner': 'level-beginner',
      'Intermediate': 'level-intermediate',
      'Advanced': 'level-advanced'
    }[level] || '';

    return `
      <div class="course-card" data-level="${level.toLowerCase()}">
        <div class="course-card-header">
          <img class="course-card-img" src="${imgSrc}" alt="${title}" loading="lazy">
          <div class="course-level-badge ${levelClass}">
            <i class="fas ${levelIcon}"></i>
            ${level}
          </div>
        </div>
        <div class="course-card-body">
          <div class="course-title">${title}</div>
          <div class="course-desc">${desc}</div>
          
          <div class="course-stats">
            ${rating > 0 ? `
              <div class="course-rating">
                <div class="stars">${generateStarRating(rating)}</div>
                <span class="rating-number">${rating}</span>
              </div>
            ` : ''}
            ${students ? `<div class="course-students"><i class="fas fa-users"></i> ${students} students</div>` : ''}
          </div>

          <div class="course-meta">
            ${duration ? `<span class="meta-item"><i class="far fa-clock"></i> ${duration}</span>` : ''}
          </div>
          
          <div class="course-tags">
            ${tags.map(tag => `<span class="course-tag">${escapeHTML(tag)}</span>`).join('')}
          </div>
          
          <div class="course-card-footer">
            <div class="course-instructor">
              <i class="fas fa-user-tie"></i>
              <span>${instructor}</span>
            </div>
            <div class="course-price-section">
              <span class="course-price">${price}</span>
              ${course.price > 0 ? '<button class="enroll-btn">Enroll Now</button>' : '<button class="enroll-btn free">Start Free</button>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Pagination state
  let currentPage = 1;
  let totalPages = 1;
  let totalCourses = 0;
  let pageLimit = 10;
  let lastQuery = '';

  // Store last loaded courses for client-side filtering fallback (if needed)
  let allCourses = [];
  let filteredCourses = [];

  // Update results counter
  function updateResultsCounter(count, query = '', total = null) {
    const counter = document.getElementById('results-counter');
    if (total === null) total = count;
    if (count === total && !query) {
      counter.style.display = 'none';
      return;
    }
    counter.style.display = 'block';
    if (query) {
      counter.innerHTML = `<i class="fas fa-search"></i> Found ${count} course${count !== 1 ? 's' : ''} for "${escapeHTML(query)}"`;
    } else {
      counter.innerHTML = `<i class="fas fa-graduation-cap"></i> Showing ${count} of ${total} course${total !== 1 ? 's' : ''}`;
    }
  }

  // Render pagination controls
  function renderPagination(page, totalPages) {
    const container = document.getElementById('pagination-container');
    if (totalPages <= 1) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }
    container.style.display = 'flex';

    let html = '';
    // Previous button
    html += `<button class="pagination-btn" ${page === 1 ? 'disabled' : ''} data-page="${page - 1}"><i class="fas fa-angle-left"></i></button>`;

    // Page numbers (show up to 5 pages, with ... if needed)
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (page <= 3) {
      end = Math.min(5, totalPages);
    }
    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }
    if (start > 1) {
      html += `<button class="pagination-btn" data-page="1">1</button>`;
      if (start > 2) html += `<span class="pagination-ellipsis">...</span>`;
    }
    for (let i = start; i <= end; i++) {
      html += `<button class="pagination-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (end < totalPages) {
      if (end < totalPages - 1) html += `<span class="pagination-ellipsis">...</span>`;
      html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    // Next button
    html += `<button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}"><i class="fas fa-angle-right"></i></button>`;

    container.innerHTML = html;

    // Add event listeners
    Array.from(container.querySelectorAll('.pagination-btn')).forEach(btn => {
      btn.addEventListener('click', function() {
        const pageNum = parseInt(this.getAttribute('data-page'));
        if (!isNaN(pageNum) && pageNum !== currentPage && pageNum >= 1 && pageNum <= totalPages) {
          goToPage(pageNum, lastQuery);
        }
      });
    });
  }

  // Show total pages and navigation info under all courses
  function updatePagesInfo() {
    const infoDiv = document.getElementById('courses-pages-info');
    if (totalCourses === 0) {
      infoDiv.style.display = 'none';
      infoDiv.innerHTML = '';
      return;
    }
    infoDiv.style.display = 'block';
    let infoText = `Total pages: <strong>${totalPages}</strong>`;
    if (totalPages > 1) {
      infoText += ` &mdash; You can view other pages using the navigation above.`;
    } else {
      infoText += ` &mdash; All courses are shown on one page.`;
    }
    infoDiv.innerHTML = infoText;
  }

  // Fetch and render courses from API with pagination and search
  function fetchAndRenderCourses({ page = 1, limit = 10, query = '' } = {}) {
    const loading = document.getElementById('courses-loading');
    const container = document.getElementById('courses-container');
    const errorDiv = document.getElementById('courses-error');
    const pagination = document.getElementById('pagination-container');

    loading.style.display = 'flex';
    container.style.display = 'none';
    errorDiv.style.display = 'none';
    pagination.style.display = 'none';
    container.innerHTML = '';

    // Build API URL
    let apiUrl = `https://localhost:5000/courses/api/courses?page=${page}&limit=${limit}`;
    if (query && query.trim()) {
      apiUrl += `&search=${encodeURIComponent(query.trim())}`;
    }

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // API returns: { total, page, limit, totalPages, courses: [...] }
        if (data && Array.isArray(data.courses)) {
          allCourses = data.courses;
          filteredCourses = data.courses;
          currentPage = data.page || 1;
          totalPages = data.totalPages || 1;
          totalCourses = data.total || data.courses.length;
          pageLimit = data.limit || limit;
        } else {
          allCourses = [];
          filteredCourses = [];
          currentPage = 1;
          totalPages = 1;
          totalCourses = 0;
        }
        loading.style.display = 'none';
        renderCourses(filteredCourses);
        updateResultsCounter(filteredCourses.length, query, totalCourses);
        renderPagination(currentPage, totalPages);
        updatePagesInfo();
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        // Fallback to static data if fetch fails
        allCourses = [
          {
            _id: "1",
            title: "Modern JavaScript Bootcamp",
            description: "Master ES6+, async programming, and build real-world applications with modern JavaScript techniques.",
            instructor: "Sarah Lee",
            price: 49,
            tags: ["JavaScript", "Web", "Frontend"],
            duration: 12,
            level: "Beginner",
            imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
            students: 1250,
            rating: 4.8
          },
          {
            _id: "2",
            title: "Python for Data Science",
            description: "Data analysis, visualization, and machine learning with Python. Perfect for aspiring data scientists.",
            instructor: "Dr. Ahmed Nasser",
            price: 59,
            tags: ["Python", "Data Science", "ML"],
            duration: 15,
            level: "Intermediate",
            imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
            students: 890,
            rating: 4.9
          },
          {
            _id: "3",
            title: "React & Redux Complete Guide",
            description: "Build scalable single-page applications with React, Redux, and modern hooks patterns.",
            instructor: "Emily Chen",
            price: 0,
            tags: ["React", "Redux", "Frontend"],
            duration: 10,
            level: "Intermediate",
            imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
            students: 2100,
            rating: 4.7
          },
          {
            _id: "4",
            title: "Node.js & Express API Mastery",
            description: "Create RESTful APIs, implement authentication, and deploy production-ready Node.js applications.",
            instructor: "Mohamed Salah",
            price: 39,
            tags: ["Node.js", "Backend", "API"],
            duration: 9,
            level: "Advanced",
            imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
            students: 650,
            rating: 4.6
          },
          {
            _id: "5",
            title: "UI/UX Design Fundamentals",
            description: "Learn design thinking, user research, and create beautiful interfaces that users love.",
            instructor: "Lisa Rodriguez",
            price: 79,
            tags: ["Design", "UI/UX", "Creative"],
            duration: 14,
            level: "Beginner",
            imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
            students: 980,
            rating: 4.8
          },
          {
            _id: "6",
            title: "Machine Learning with TensorFlow",
            description: "Dive deep into neural networks, deep learning, and AI model development with TensorFlow.",
            instructor: "Dr. James Park",
            price: 99,
            tags: ["ML", "AI", "TensorFlow"],
            duration: 20,
            level: "Advanced",
            imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
            students: 420,
            rating: 4.9
          }
        ];
        filteredCourses = [...allCourses];
        currentPage = 1;
        totalPages = 1;
        totalCourses = allCourses.length;
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <div>Could not load courses from server</div>
          <div class="error-details">Showing sample courses instead</div>
        `;
        renderCourses(allCourses);
        updateResultsCounter(allCourses.length, query, allCourses.length);
        renderPagination(1, 1);
        updatePagesInfo();
      });
  }

  // Enhanced render function with animations
  function renderCourses(courses) {
    const container = document.getElementById('courses-container');
    container.innerHTML = '';
    
    if (Array.isArray(courses) && courses.length > 0) {
      courses.forEach((course, index) => {
        const courseElement = document.createElement('div');
        courseElement.innerHTML = renderCourseCard(course);
        courseElement.firstElementChild.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(courseElement.firstElementChild);
      });
    } else {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search-minus"></i>
          <h3>No courses found</h3>
          <p>Try adjusting your search terms or browse all courses</p>
          <button class="clear-filters-btn" onclick="clearSearch()">
            <i class="fas fa-times"></i> Clear Search
          </button>
        </div>
      `;
    }
    
    container.style.display = 'grid';
  }

  // Go to a specific page (with optional search query)
  function goToPage(page, query = '') {
    fetchAndRenderCourses({ page, limit: pageLimit, query });
  }

  // Enhanced search with server-side filtering
  function filterCourses(query) {
    lastQuery = query;
    goToPage(1, query);
  }

  // Clear search function
  function clearSearch() {
    const searchInput = document.getElementById('course-search-input');
    const clearBtn = document.getElementById('clear-search');
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    filterCourses('');
    searchInput.focus();
  }

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    fetchAndRenderCourses({ page: 1, limit: pageLimit });

    const searchInput = document.getElementById('course-search-input');
    const searchForm = document.getElementById('course-search-form');
    const clearBtn = document.getElementById('clear-search');

    // Enhanced search with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
      const value = e.target.value;
      // Show/hide clear button
      if (value.trim()) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
      // Debounced search
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filterCourses(value);
      }, 300);
    });

    // Clear search functionality
    clearBtn.addEventListener('click', clearSearch);

    // Form submit handling
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearTimeout(searchTimeout);
      filterCourses(searchInput.value);
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Focus search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      // Clear search on Escape
      if (e.key === 'Escape' && searchInput === document.activeElement) {
        clearSearch();
      }
    });
  });