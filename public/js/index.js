// ===== HOME PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
    loadStats();
    initializeAnimations();
});

// ===== INITIALIZATION =====
function initializeHomePage() {
    initializeCourseCards();
    initializeCategoryCards();
    initializeScrollAnimations();
}

// ===== COURSE CARDS =====
function initializeCourseCards() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        // Track course views
        const courseLink = card.querySelector('.course-title a');
        if (courseLink) {
            courseLink.addEventListener('click', function(e) {
                const courseId = this.getAttribute('href').split('/').pop();
                trackCourseView(courseId);
            });
        }
    });
}

// ===== CATEGORY CARDS =====
function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const category = this.getAttribute('href').split('category=')[1];
            trackCategoryClick(category);
        });
    });
}

// ===== LOAD STATISTICS =====
async function loadStats() {
    try {
        const response = await JooCourses.apiCall('/api/stats/overview');
        
        if (response.success) {
            updateStatsDisplay(response.data.stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Use default values if API fails
    }
}

function updateStatsDisplay(stats) {
    const elements = {
        'total-courses': stats.totalCourses || '10,000+',
        'total-students': stats.totalStudents || '50,000+',
        'total-instructors': stats.totalInstructors || '1,000+',
        'total-certificates': stats.totalCertificates || '25,000+'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, value);
        }
    });
}

function animateNumber(element, targetValue) {
    // Extract number from string like "10,000+"
    const numericValue = parseInt(targetValue.toString().replace(/[^\d]/g, ''));
    const suffix = targetValue.toString().replace(/[\d,]/g, '');
    
    if (isNaN(numericValue)) {
        element.textContent = targetValue;
        return;
    }

    let currentValue = 0;
    const increment = Math.ceil(numericValue / 50);
    const duration = 2000; // 2 seconds
    const stepTime = duration / (numericValue / increment);

    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
        }
        
        element.textContent = formatNumber(currentValue) + suffix;
    }, stepTime);
}

function formatNumber(num) {
    return num.toLocaleString();
}

// ===== SCROLL ANIMATIONS ===== 
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.course-card, .category-card, .stat-card');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

function initializeAnimations() {
    // Add CSS for scroll animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .course-card.animate-on-scroll {
            transition-delay: 0.1s;
        }
        
        .course-card:nth-child(2).animate-on-scroll {
            transition-delay: 0.2s;
        }
        
        .course-card:nth-child(3).animate-on-scroll {
            transition-delay: 0.3s;
        }
    `;
    document.head.appendChild(style);
}

// ===== ANALYTICS TRACKING =====
function trackCourseView(courseId) {
    // Track course view for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'course_view', {
            'course_id': courseId,
            'page_location': window.location.href
        });
    }
    
    // You can also send to your own analytics endpoint
    JooCourses.apiCall('/api/analytics/course-view', {
        method: 'POST',
        body: JSON.stringify({ courseId })
    }).catch(error => {
        console.log('Analytics tracking failed:', error);
    });
}

function trackCategoryClick(category) {
    // Track category click for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'category_click', {
            'category': category,
            'page_location': window.location.href
        });
    }
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchForm = document.getElementById('hero-search-form');
    const searchInput = document.getElementById('hero-search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/courses?search=${encodeURIComponent(query)}`;
            }
        });

        // Search suggestions (if you want to implement)
        searchInput.addEventListener('input', JooCourses.debounce(function() {
            const query = this.value.trim();
            if (query.length >= 2) {
                loadSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        }, 300));
    }
}

async function loadSearchSuggestions(query) {
    try {
        const response = await JooCourses.apiCall(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.success) {
            showSearchSuggestions(response.data.suggestions);
        }
    } catch (error) {
        console.error('Error loading search suggestions:', error);
    }
}

function showSearchSuggestions(suggestions) {
    // Implementation for search suggestions dropdown
    // This would create a dropdown with course suggestions
}

function hideSearchSuggestions() {
    const suggestionsDropdown = document.getElementById('search-suggestions');
    if (suggestionsDropdown) {
        suggestionsDropdown.classList.add('hidden');
    }
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== NEWSLETTER SIGNUP =====
function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();

            if (!email) {
                JooCourses.showFlashMessage('error', 'Please enter your email address');
                return;
            }

            try {
                setButtonLoading(submitBtn, true);
                
                const response = await JooCourses.apiCall('/api/newsletter/subscribe', {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });

                if (response.success) {
                    JooCourses.showFlashMessage('success', 'Thank you for subscribing!');
                    emailInput.value = '';
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                JooCourses.showFlashMessage('error', 'Subscription failed. Please try again.');
            } finally {
                setButtonLoading(submitBtn, false);
            }
        });
    }
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// ===== INITIALIZE ALL FEATURES =====
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeLazyLoading();
    initializeSmoothScrolling();
    initializeNewsletter();
});
