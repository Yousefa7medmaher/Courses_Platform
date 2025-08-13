// ===== ADMIN DASHBOARD JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

// ===== INITIALIZATION =====
function initializeAdminDashboard() {
    loadDashboardData();
    initializeOverviewAnalytics();
    initializeUserManagement();
    initializeCourseManagement();
    initializeSystemHealth();
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
    try {
        JooCourses.showLoading();
        
        // Load all dashboard data
        const [statsResponse, usersResponse, coursesResponse, activityResponse] = await Promise.all([
            JooCourses.apiCall('/api/admin/stats'),
            JooCourses.apiCall('/api/admin/users/recent'),
            JooCourses.apiCall('/api/admin/courses/pending'),
            JooCourses.apiCall('/api/admin/activity/recent')
        ]);

        // Update stats
        if (statsResponse.success) {
            updateStats(statsResponse.data);
        }

        // Update recent users
        if (usersResponse.success) {
            updateRecentUsers(usersResponse.data.users);
        }

        // Update course management
        if (coursesResponse.success) {
            updateCourseManagement(coursesResponse.data.courses);
        }

        // Update platform activity
        if (activityResponse.success) {
            updatePlatformActivity(activityResponse.data.activities);
        }

        // Load system alerts
        loadSystemAlerts();

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
        'total-users': stats.totalUsers || 0,
        'total-courses': stats.totalCourses || 0,
        'active-students': stats.activeStudents || 0,
        'active-instructors': stats.activeInstructors || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, value);
        }
    });
}

function animateNumber(element, targetValue) {
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// ===== RECENT USERS =====
function updateRecentUsers(users) {
    const container = document.getElementById('recent-users');
    if (!container) return;

    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3>No recent users</h3>
                <p>New user registrations will appear here</p>
            </div>
        `;
        return;
    }

    const usersHtml = users.slice(0, 5).map(user => `
        <div class="user-item" onclick="viewUserDetails('${user._id}')">
            <div class="user-avatar">
                ${user.photo ? 
                    `<img src="${user.photo}" alt="${user.name}">` :
                    `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`
                }
            </div>
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
                <div class="user-meta">
                    <span class="badge badge-${user.role}">${user.role}</span>
                    <span class="user-date">${getTimeAgo(user.createdAt)}</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-sm btn-outline" onclick="editUser('${user._id}'); event.stopPropagation();">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = usersHtml;
}

// ===== COURSE MANAGEMENT =====
function updateCourseManagement(courses) {
    const container = document.getElementById('course-management');
    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No pending courses</h3>
                <p>Courses awaiting approval will appear here</p>
            </div>
        `;
        return;
    }

    const coursesHtml = courses.slice(0, 5).map(course => `
        <div class="course-management-item">
            <div class="course-thumbnail">
                ${course.imageUrl ? 
                    `<img src="${course.imageUrl}" alt="${course.title}">` :
                    `<div class="thumbnail-placeholder"><i class="fas fa-book"></i></div>`
                }
            </div>
            <div class="course-info">
                <div class="course-name">${course.title}</div>
                <div class="course-instructor">by ${course.instructor.name}</div>
                <div class="course-meta">
                    ${course.category} • ${course.level} • ${JooCourses.formatCurrency(course.price)}
                </div>
            </div>
            <div class="course-actions">
                <button class="btn btn-sm btn-success" onclick="approveCourse('${course._id}')">
                    <i class="fas fa-check"></i>
                    Approve
                </button>
                <button class="btn btn-sm btn-error" onclick="rejectCourse('${course._id}')">
                    <i class="fas fa-times"></i>
                    Reject
                </button>
                <button class="btn btn-sm btn-outline" onclick="viewCourseDetails('${course._id}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = coursesHtml;
}

// ===== PLATFORM ACTIVITY =====
function updatePlatformActivity(activities) {
    const container = document.getElementById('platform-activity');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No recent activity</h3>
                <p>Platform activity will appear here</p>
            </div>
        `;
        return;
    }

    const activitiesHtml = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.description}</div>
                <div class="activity-time">${getTimeAgo(activity.createdAt)}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = activitiesHtml;
}

function getActivityIcon(type) {
    const icons = {
        user_registration: 'user-plus',
        course_creation: 'book',
        course_enrollment: 'user-graduate',
        course_completion: 'check-circle',
        review_submitted: 'star',
        payment_received: 'dollar-sign'
    };
    return icons[type] || 'info-circle';
}

// ===== SYSTEM HEALTH =====
function initializeSystemHealth() {
    loadSystemHealth();
    
    // Refresh system health every minute
    setInterval(loadSystemHealth, 60000);
}

async function loadSystemHealth() {
    try {
        const response = await JooCourses.apiCall('/api/admin/system/health');
        
        if (response.success) {
            updateSystemHealth(response.data);
        }
    } catch (error) {
        console.error('Error loading system health:', error);
    }
}

function updateSystemHealth(health) {
    // Update storage status
    const storageStatus = document.getElementById('storage-status');
    const storageUsage = document.getElementById('storage-usage');
    
    if (storageStatus && storageUsage && health.storage) {
        const usagePercent = (health.storage.used / health.storage.total * 100).toFixed(1);
        storageUsage.textContent = `${usagePercent}% used`;
        
        const statusIcon = storageStatus.querySelector('i');
        if (usagePercent > 90) {
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = 'var(--error)';
        } else if (usagePercent > 75) {
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = 'var(--warning)';
        } else {
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = 'var(--success)';
        }
    }
}

// ===== SYSTEM ALERTS =====
async function loadSystemAlerts() {
    try {
        const response = await JooCourses.apiCall('/api/admin/alerts');
        
        if (response.success) {
            updateSystemAlerts(response.data.alerts);
        }
    } catch (error) {
        console.error('Error loading system alerts:', error);
    }
}

function updateSystemAlerts(alerts) {
    const container = document.getElementById('alerts-list');
    if (!container) return;

    if (!alerts || alerts.length === 0) {
        container.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle"></i>
                <p>No system alerts. Everything is running smoothly!</p>
            </div>
        `;
        return;
    }

    const alertsHtml = alerts.map(alert => `
        <div class="alert-item alert-${alert.severity}">
            <div class="alert-icon">
                <i class="fas fa-${getAlertIcon(alert.severity)}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${getTimeAgo(alert.createdAt)}</div>
            </div>
            <button class="alert-dismiss" onclick="dismissAlert('${alert._id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    container.innerHTML = alertsHtml;
}

function getAlertIcon(severity) {
    const icons = {
        low: 'info-circle',
        medium: 'exclamation-triangle',
        high: 'exclamation-circle',
        critical: 'times-circle'
    };
    return icons[severity] || 'info-circle';
}

// ===== OVERVIEW ANALYTICS =====
function initializeOverviewAnalytics() {
    const periodSelect = document.getElementById('overview-period');
    
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            loadOverviewData(this.value);
        });
        
        // Load initial data
        loadOverviewData(periodSelect.value);
    }
}

async function loadOverviewData(period) {
    try {
        const response = await JooCourses.apiCall(`/api/admin/overview?period=${period}`);
        
        if (response.success) {
            updateOverviewCharts(response.data);
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
    }
}

function updateOverviewCharts(data) {
    // Update charts using Chart.js
    updateChart('registrations-chart', data.registrations);
    updateChart('enrollments-chart', data.enrollments);
    updateChart('revenue-chart', data.revenue);
    updateActivityMetrics(data.activity);
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

function updateActivityMetrics(activity) {
    const container = document.getElementById('activity-metrics');
    if (!container) return;

    const metricsHtml = `
        <div class="metric-item">
            <div class="metric-label">Daily Active Users</div>
            <div class="metric-value">${activity.dailyActiveUsers || 0}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Course Completions</div>
            <div class="metric-value">${activity.courseCompletions || 0}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">New Reviews</div>
            <div class="metric-value">${activity.newReviews || 0}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Support Tickets</div>
            <div class="metric-value">${activity.supportTickets || 0}</div>
        </div>
    `;

    container.innerHTML = metricsHtml;
}

// ===== USER MANAGEMENT =====
function initializeUserManagement() {
    // Initialize user management functionality
}

async function viewUserDetails(userId) {
    try {
        const response = await JooCourses.apiCall(`/api/admin/users/${userId}`);
        
        if (response.success) {
            const user = response.data.user;
            showUserModal(user);
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        JooCourses.showFlashMessage('error', 'Failed to load user details');
    }
}

function showUserModal(user) {
    const modalContent = document.getElementById('user-details-content');
    if (!modalContent) return;

    modalContent.innerHTML = `
        <div class="user-details">
            <div class="user-header">
                <div class="user-avatar-large">
                    ${user.photo ? 
                        `<img src="${user.photo}" alt="${user.name}">` :
                        `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`
                    }
                </div>
                <div class="user-info">
                    <h3>${user.name}</h3>
                    <p>${user.email}</p>
                    <span class="badge badge-${user.role}">${user.role}</span>
                </div>
            </div>
            
            <div class="user-stats">
                <div class="stat">
                    <label>Courses Enrolled:</label>
                    <span>${user.enrolledCourses || 0}</span>
                </div>
                <div class="stat">
                    <label>Courses Completed:</label>
                    <span>${user.completedCourses || 0}</span>
                </div>
                <div class="stat">
                    <label>Last Login:</label>
                    <span>${user.lastLogin ? JooCourses.formatDate(user.lastLogin) : 'Never'}</span>
                </div>
                <div class="stat">
                    <label>Member Since:</label>
                    <span>${JooCourses.formatDate(user.createdAt)}</span>
                </div>
            </div>
            
            <div class="user-actions-modal">
                <button class="btn btn-outline" onclick="changeUserRole('${user._id}', '${user.role}')">
                    <i class="fas fa-user-tag"></i>
                    Change Role
                </button>
                <button class="btn btn-warning" onclick="suspendUser('${user._id}')">
                    <i class="fas fa-ban"></i>
                    Suspend User
                </button>
                <button class="btn btn-error" onclick="deleteUser('${user._id}')">
                    <i class="fas fa-trash"></i>
                    Delete User
                </button>
            </div>
        </div>
    `;

    JooCourses.openModal('user-modal');
}

async function editUser(userId) {
    viewUserDetails(userId);
}

async function changeUserRole(userId, currentRole) {
    const newRole = prompt(`Change user role from ${currentRole} to:`, currentRole);
    if (!newRole || newRole === currentRole) return;

    try {
        const response = await JooCourses.apiCall(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'User role updated successfully');
            JooCourses.closeModal('user-modal');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to update user role');
    }
}

async function suspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) {
        return;
    }

    try {
        const response = await JooCourses.apiCall(`/api/admin/users/${userId}/suspend`, {
            method: 'PUT'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'User suspended successfully');
            JooCourses.closeModal('user-modal');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error suspending user:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to suspend user');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await JooCourses.apiCall(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'User deleted successfully');
            JooCourses.closeModal('user-modal');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to delete user');
    }
}

// ===== COURSE APPROVAL =====
async function approveCourse(courseId) {
    try {
        const response = await JooCourses.apiCall(`/api/admin/courses/${courseId}/approve`, {
            method: 'PUT'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Course approved successfully');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error approving course:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to approve course');
    }
}

async function rejectCourse(courseId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
        const response = await JooCourses.apiCall(`/api/admin/courses/${courseId}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Course rejected');
            loadDashboardData(); // Refresh dashboard
        }
    } catch (error) {
        console.error('Error rejecting course:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to reject course');
    }
}

async function viewCourseDetails(courseId) {
    window.open(`/courses/${courseId}`, '_blank');
}

// ===== SYSTEM ALERTS =====
async function dismissAlert(alertId) {
    try {
        const response = await JooCourses.apiCall(`/api/admin/alerts/${alertId}/dismiss`, {
            method: 'PUT'
        });

        if (response.success) {
            loadSystemAlerts(); // Refresh alerts
        }
    } catch (error) {
        console.error('Error dismissing alert:', error);
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

// Auto-refresh every 2 minutes for admin dashboard
setInterval(refreshDashboard, 2 * 60 * 1000);
