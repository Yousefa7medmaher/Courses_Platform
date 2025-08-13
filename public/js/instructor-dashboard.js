// ===== INSTRUCTOR DASHBOARD JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeInstructorDashboard();
});

// ===== INITIALIZATION =====
function initializeInstructorDashboard() {
    loadDashboardData();
    initializeAnalytics();
    initializeCourseManagement();
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
    try {
        JooCourses.showLoading();
        
        // Load all dashboard data
        const [statsResponse, coursesResponse, enrollmentsResponse, reviewsResponse] = await Promise.all([
            JooCourses.apiCall('/api/instructor/stats'),
            JooCourses.apiCall('/api/instructor/courses'),
            JooCourses.apiCall('/api/instructor/enrollments/recent'),
            JooCourses.apiCall('/api/instructor/reviews/recent')
        ]);

        // Update stats
        if (statsResponse.success) {
            updateStats(statsResponse.data);
        }

        // Update courses
        if (coursesResponse.success) {
            updateInstructorCourses(coursesResponse.data.courses);
        }

        // Update enrollments
        if (enrollmentsResponse.success) {
            updateRecentEnrollments(enrollmentsResponse.data.enrollments);
        }

        // Update reviews
        if (reviewsResponse.success) {
            updateRecentReviews(reviewsResponse.data.reviews);
        }

        // Load course status
        loadCourseStatus();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        JooCourses.showFlashMessage('error', 'Failed to load dashboard data');
    } finally {
        JooCourses.hideLoading();
    }
}

// ===== UPDATE STATS =====
function updateStats(stats) {
    const elements = {
        'total-courses': stats.totalCourses || 0,
        'total-students': stats.totalStudents || 0,
        'average-rating': (stats.averageRating || 0).toFixed(1),
        'total-earnings': JooCourses.formatCurrency(stats.totalEarnings || 0)
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'total-earnings') {
                element.textContent = value;
            } else {
                animateNumber(element, value);
            }
        }
    });
}

function animateNumber(element, targetValue) {
    const numericValue = parseFloat(targetValue);
    if (isNaN(numericValue)) {
        element.textContent = targetValue;
        return;
    }

    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (numericValue - startValue) * progress;
        
        if (targetValue.includes('.')) {
            element.textContent = currentValue.toFixed(1);
        } else {
            element.textContent = Math.floor(currentValue);
        }

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// ===== INSTRUCTOR COURSES =====
function updateInstructorCourses(courses) {
    const container = document.getElementById('instructor-courses');
    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chalkboard-teacher"></i>
                <h3>No courses created yet</h3>
                <p>Create your first course to start teaching</p>
                <a href="/instructor/courses/new" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Create Your First Course
                </a>
            </div>
        `;
        return;
    }

    const coursesHtml = courses.slice(0, 5).map(course => `
        <div class="instructor-course-item">
            <div class="course-thumbnail">
                ${course.imageUrl ? 
                    `<img src="${course.imageUrl}" alt="${course.title}">` :
                    `<div class="thumbnail-placeholder"><i class="fas fa-book"></i></div>`
                }
            </div>
            <div class="course-info">
                <h4 class="course-name">${course.title}</h4>
                <div class="course-stats">
                    <span>${course.totalStudents} students</span>
                    <span>${course.averageRating.toFixed(1)} ★</span>
                    <span>${JooCourses.formatCurrency(course.price)}</span>
                </div>
                <div class="course-status status-${course.status.toLowerCase()}">${course.status}</div>
            </div>
            <div class="course-actions">
                <a href="/instructor/courses/${course._id}/edit" class="btn btn-sm btn-outline">
                    <i class="fas fa-edit"></i>
                    Edit
                </a>
                <a href="/instructor/courses/${course._id}/analytics" class="btn btn-sm btn-primary">
                    <i class="fas fa-chart-line"></i>
                    Analytics
                </a>
            </div>
        </div>
    `).join('');

    container.innerHTML = coursesHtml;
}

// ===== RECENT ENROLLMENTS =====
function updateRecentEnrollments(enrollments) {
    const container = document.getElementById('recent-enrollments');
    if (!container) return;

    if (!enrollments || enrollments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3>No recent enrollments</h3>
                <p>New student enrollments will appear here</p>
            </div>
        `;
        return;
    }

    const enrollmentsHtml = enrollments.slice(0, 5).map(enrollment => `
        <div class="enrollment-item">
            <div class="student-avatar">
                ${enrollment.student.photo ? 
                    `<img src="${enrollment.student.photo}" alt="${enrollment.student.name}">` :
                    `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`
                }
            </div>
            <div class="enrollment-info">
                <div class="student-name">${enrollment.student.name}</div>
                <div class="enrollment-course">${enrollment.course.title}</div>
                <div class="enrollment-date">${getTimeAgo(enrollment.enrolledAt)}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = enrollmentsHtml;
}

// ===== RECENT REVIEWS =====
function updateRecentReviews(reviews) {
    const container = document.getElementById('recent-reviews');
    if (!container) return;

    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No recent reviews</h3>
                <p>Student reviews will appear here</p>
            </div>
        `;
        return;
    }

    const reviewsHtml = reviews.slice(0, 5).map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <span class="reviewer-name">${review.user.name}</span>
                    <div class="review-rating">
                        ${Array.from({length: 5}, (_, i) => 
                            `<i class="fas fa-star ${i < review.rating ? 'active' : ''}"></i>`
                        ).join('')}
                    </div>
                </div>
                <span class="review-course">${review.course.title}</span>
            </div>
            ${review.review ? `<p class="review-text">${review.review}</p>` : ''}
        </div>
    `).join('');

    container.innerHTML = reviewsHtml;
}

// ===== COURSE STATUS =====
async function loadCourseStatus() {
    try {
        const response = await JooCourses.apiCall('/api/instructor/courses/status');
        
        if (response.success) {
            updateCourseStatus(response.data.courses);
        }
    } catch (error) {
        console.error('Error loading course status:', error);
    }
}

function updateCourseStatus(courses) {
    const container = document.getElementById('course-status');
    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No courses to manage</h3>
                <p>Create courses to see their status here</p>
            </div>
        `;
        return;
    }

    const statusHtml = courses.map(course => `
        <div class="status-item">
            <div class="status-info">
                <div class="status-course-name">${course.title}</div>
                <div class="status-details">
                    ${course.totalStudents} students • 
                    Last updated: ${JooCourses.formatDate(course.updatedAt)}
                </div>
            </div>
            <span class="status-badge badge-${course.status.toLowerCase()}">${course.status}</span>
        </div>
    `).join('');

    container.innerHTML = statusHtml;
}

// ===== ANALYTICS =====
function initializeAnalytics() {
    const periodSelect = document.getElementById('analytics-period');
    
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            loadAnalyticsData(this.value);
        });
        
        // Load initial data
        loadAnalyticsData(periodSelect.value);
    }
}

async function loadAnalyticsData(period) {
    try {
        const response = await JooCourses.apiCall(`/api/instructor/analytics?period=${period}`);
        
        if (response.success) {
            updateAnalyticsCharts(response.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updateAnalyticsCharts(data) {
    // Update views chart
    updateChart('views-chart', data.views);
    
    // Update enrollments chart
    updateChart('enrollments-chart', data.enrollments);
    
    // Update revenue chart
    updateChart('revenue-chart', data.revenue);
    
    // Update ratings breakdown
    updateRatingsBreakdown(data.ratings);
}

function updateChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    // Destroy existing chart if it exists
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.label,
                data: data.values,
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateRatingsBreakdown(ratings) {
    const container = document.getElementById('ratings-breakdown');
    if (!container) return;

    const total = ratings.reduce((sum, rating) => sum + rating.count, 0);
    
    const ratingsHtml = ratings.map(rating => {
        const percentage = total > 0 ? (rating.count / total * 100).toFixed(1) : 0;
        return `
            <div class="rating-breakdown-item">
                <div class="rating-stars">
                    ${Array.from({length: 5}, (_, i) => 
                        `<i class="fas fa-star ${i < rating.stars ? 'active' : ''}"></i>`
                    ).join('')}
                </div>
                <div class="rating-bar">
                    <div class="rating-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-count">${rating.count}</span>
            </div>
        `;
    }).join('');

    container.innerHTML = ratingsHtml;
}

// ===== COURSE MANAGEMENT =====
function initializeCourseManagement() {
    // Add event listeners for course management actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.course-actions')) {
            const action = e.target.getAttribute('data-action');
            const courseId = e.target.getAttribute('data-course-id');
            
            if (action && courseId) {
                handleCourseAction(action, courseId);
            }
        }
    });
}

async function handleCourseAction(action, courseId) {
    switch (action) {
        case 'publish':
            await publishCourse(courseId);
            break;
        case 'unpublish':
            await unpublishCourse(courseId);
            break;
        case 'delete':
            await deleteCourse(courseId);
            break;
        default:
            console.warn('Unknown course action:', action);
    }
}

async function publishCourse(courseId) {
    if (!confirm('Are you sure you want to publish this course?')) {
        return;
    }

    try {
        const response = await JooCourses.apiCall(`/api/instructor/courses/${courseId}/publish`, {
            method: 'PUT'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Course published successfully!');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error publishing course:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to publish course');
    }
}

async function unpublishCourse(courseId) {
    if (!confirm('Are you sure you want to unpublish this course?')) {
        return;
    }

    try {
        const response = await JooCourses.apiCall(`/api/instructor/courses/${courseId}/unpublish`, {
            method: 'PUT'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Course unpublished successfully!');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error unpublishing course:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to unpublish course');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await JooCourses.apiCall(`/api/instructor/courses/${courseId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Course deleted successfully!');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to delete course');
    }
}

// ===== UTILITY FUNCTIONS =====
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return JooCourses.formatDate(dateString);
}

// ===== REFRESH DASHBOARD =====
function refreshDashboard() {
    loadDashboardData();
}

// Auto-refresh every 5 minutes
setInterval(refreshDashboard, 5 * 60 * 1000);
