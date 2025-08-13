// ===== STUDENT DASHBOARD JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeStudentDashboard();
});

// ===== INITIALIZATION =====
function initializeStudentDashboard() {
    loadDashboardData();
    initializeGoalsModal();
    initializeContinueLearning();
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
    try {
        JooCourses.showLoading();
        
        // Load all dashboard data
        const [statsResponse, coursesResponse, activityResponse, recommendationsResponse] = await Promise.all([
            JooCourses.apiCall('/api/student/stats'),
            JooCourses.apiCall('/api/student/courses'),
            JooCourses.apiCall('/api/student/activity'),
            JooCourses.apiCall('/api/student/recommendations')
        ]);

        // Update stats
        if (statsResponse.success) {
            updateStats(statsResponse.data);
        }

        // Update continue learning
        if (coursesResponse.success) {
            updateContinueLearning(coursesResponse.data.courses);
        }

        // Update activity feed
        if (activityResponse.success) {
            updateActivityFeed(activityResponse.data.activities);
        }

        // Update recommendations
        if (recommendationsResponse.success) {
            updateRecommendations(recommendationsResponse.data.courses);
        }

        // Load learning goals
        loadLearningGoals();
        
        // Load achievements
        loadAchievements();

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
        'enrolled-courses': stats.enrolledCourses || 0,
        'completed-courses': stats.completedCourses || 0,
        'certificates-earned': stats.certificatesEarned || 0,
        'learning-hours': stats.learningHours || 0
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
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// ===== CONTINUE LEARNING =====
function updateContinueLearning(courses) {
    const container = document.getElementById('continue-learning');
    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No courses in progress</h3>
                <p>Start learning by enrolling in a course</p>
                <a href="/courses" class="btn btn-primary">Browse Courses</a>
            </div>
        `;
        return;
    }

    const coursesHtml = courses.slice(0, 3).map(course => `
        <div class="learning-item">
            <div class="learning-thumbnail">
                ${course.imageUrl ? 
                    `<img src="${course.imageUrl}" alt="${course.title}">` :
                    `<div class="thumbnail-placeholder"><i class="fas fa-book"></i></div>`
                }
            </div>
            <div class="learning-info">
                <h4 class="learning-title">${course.title}</h4>
                <div class="learning-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${course.progress || 0}%</span>
                </div>
                <div class="learning-meta">
                    Last accessed: ${JooCourses.formatDate(course.lastAccessed)}
                </div>
            </div>
            <div class="learning-actions">
                <a href="/student/courses/${course._id}" class="btn btn-primary btn-sm">
                    <i class="fas fa-play"></i>
                    Continue
                </a>
            </div>
        </div>
    `).join('');

    container.innerHTML = coursesHtml;
}

// ===== ACTIVITY FEED =====
function updateActivityFeed(activities) {
    const container = document.getElementById('activity-feed');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No recent activity</h3>
                <p>Your learning activity will appear here</p>
            </div>
        `;
        return;
    }

    const activitiesHtml = activities.slice(0, 5).map(activity => `
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
        enrollment: 'user-plus',
        completion: 'check-circle',
        certificate: 'certificate',
        review: 'star',
        login: 'sign-in-alt'
    };
    return icons[type] || 'info-circle';
}

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

// ===== RECOMMENDATIONS =====
function updateRecommendations(courses) {
    const container = document.getElementById('recommended-courses');
    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lightbulb"></i>
                <h3>No recommendations yet</h3>
                <p>Complete more courses to get personalized recommendations</p>
            </div>
        `;
        return;
    }

    const coursesHtml = courses.slice(0, 4).map(course => `
        <div class="recommendation-card">
            <div class="recommendation-image">
                ${course.imageUrl ? 
                    `<img src="${course.imageUrl}" alt="${course.title}">` :
                    `<div class="image-placeholder"><i class="fas fa-book"></i></div>`
                }
            </div>
            <div class="recommendation-content">
                <h4 class="recommendation-title">${course.title}</h4>
                <div class="recommendation-meta">
                    <span>${course.category}</span>
                    <span class="price">${course.price === 0 ? 'Free' : '$' + course.price}</span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = coursesHtml;
}

// ===== LEARNING GOALS =====
async function loadLearningGoals() {
    try {
        const response = await JooCourses.apiCall('/api/student/goals');
        
        if (response.success) {
            updateLearningGoals(response.data.goals);
        }
    } catch (error) {
        console.error('Error loading learning goals:', error);
    }
}

function updateLearningGoals(goals) {
    const container = document.getElementById('learning-goals');
    if (!container) return;

    if (!goals || goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-target"></i>
                <h3>No learning goals set</h3>
                <p>Set goals to track your learning progress</p>
                <button class="btn btn-primary" onclick="JooCourses.openModal('goals-modal')">
                    <i class="fas fa-plus"></i>
                    Add Your First Goal
                </button>
            </div>
        `;
        return;
    }

    const goalsHtml = goals.slice(0, 3).map(goal => `
        <div class="goal-item">
            <div class="goal-header">
                <h4 class="goal-title">${goal.title}</h4>
                <span class="goal-deadline">${JooCourses.formatDate(goal.deadline)}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                </div>
                <span class="progress-text">${goal.progress || 0}% complete</span>
            </div>
            <div class="goal-actions">
                <button class="btn btn-sm btn-outline" onclick="editGoal('${goal._id}')">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn btn-sm btn-error" onclick="deleteGoal('${goal._id}')">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = goalsHtml;
}

// ===== ACHIEVEMENTS =====
async function loadAchievements() {
    try {
        const response = await JooCourses.apiCall('/api/student/achievements');
        
        if (response.success) {
            updateAchievements(response.data.achievements);
        }
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

function updateAchievements(achievements) {
    const container = document.getElementById('achievements');
    if (!container) return;

    if (!achievements || achievements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>No achievements yet</h3>
                <p>Complete courses to earn achievements</p>
            </div>
        `;
        return;
    }

    const achievementsHtml = achievements.slice(0, 6).map(achievement => `
        <div class="achievement-item">
            <div class="achievement-icon">
                <i class="fas fa-${achievement.icon}"></i>
            </div>
            <h4 class="achievement-title">${achievement.title}</h4>
            <p class="achievement-description">${achievement.description}</p>
        </div>
    `).join('');

    container.innerHTML = achievementsHtml;
}

// ===== GOALS MODAL =====
function initializeGoalsModal() {
    const goalForm = document.getElementById('goal-form');
    
    if (goalForm) {
        goalForm.addEventListener('submit', handleGoalSubmit);
    }

    // Set minimum date to today
    const deadlineInput = document.getElementById('goal-deadline');
    if (deadlineInput) {
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.setAttribute('min', today);
    }
}

async function handleGoalSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        setButtonLoading(submitBtn, true);
        
        const response = await JooCourses.apiCall('/api/student/goals', {
            method: 'POST',
            body: JSON.stringify({
                title: formData.get('title'),
                description: formData.get('description'),
                deadline: formData.get('deadline')
            })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Learning goal added successfully!');
            JooCourses.closeModal('goals-modal');
            form.reset();
            loadLearningGoals(); // Refresh goals list
        }
    } catch (error) {
        console.error('Error adding goal:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to add goal');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function editGoal(goalId) {
    // Implementation for editing goals
    try {
        const response = await JooCourses.apiCall(`/api/student/goals/${goalId}`);
        
        if (response.success) {
            const goal = response.data.goal;
            
            // Populate form with existing data
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-description').value = goal.description || '';
            document.getElementById('goal-deadline').value = goal.deadline.split('T')[0];
            
            // Update form action for editing
            const form = document.getElementById('goal-form');
            form.setAttribute('data-goal-id', goalId);
            form.setAttribute('data-mode', 'edit');
            
            JooCourses.openModal('goals-modal');
        }
    } catch (error) {
        console.error('Error loading goal:', error);
        JooCourses.showFlashMessage('error', 'Failed to load goal details');
    }
}

async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) {
        return;
    }

    try {
        const response = await JooCourses.apiCall(`/api/student/goals/${goalId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Goal deleted successfully');
            loadLearningGoals(); // Refresh goals list
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
        JooCourses.showFlashMessage('error', 'Failed to delete goal');
    }
}

// ===== CONTINUE LEARNING =====
function initializeContinueLearning() {
    // Add click handlers for continue learning items
    document.addEventListener('click', function(e) {
        if (e.target.closest('.learning-item')) {
            const courseId = e.target.closest('.learning-item').getAttribute('data-course-id');
            if (courseId) {
                trackCourseAccess(courseId);
            }
        }
    });
}

function trackCourseAccess(courseId) {
    // Track course access for analytics
    JooCourses.apiCall('/api/analytics/course-access', {
        method: 'POST',
        body: JSON.stringify({
            courseId,
            timestamp: new Date().toISOString()
        })
    }).catch(error => {
        console.log('Analytics tracking failed:', error);
    });
}

// ===== COURSE PROGRESS =====
async function updateCourseProgress(courseId, progress) {
    try {
        const response = await JooCourses.apiCall(`/api/student/courses/${courseId}/progress`, {
            method: 'PUT',
            body: JSON.stringify({ progress })
        });

        if (response.success) {
            // Update UI to reflect new progress
            const progressBar = document.querySelector(`[data-course-id="${courseId}"] .progress-fill`);
            const progressText = document.querySelector(`[data-course-id="${courseId}"] .progress-text`);
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${progress}%`;
            }

            // Check if course is completed
            if (progress >= 100) {
                JooCourses.showFlashMessage('success', 'Congratulations! Course completed!');
                loadDashboardData(); // Refresh dashboard
            }
        }
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

// ===== WISHLIST MANAGEMENT =====
async function toggleWishlist(courseId, button) {
    try {
        const isActive = button.classList.contains('active');
        const method = isActive ? 'DELETE' : 'POST';
        
        const response = await JooCourses.apiCall(`/api/wishlist/${courseId}`, {
            method: method
        });

        if (response.success) {
            if (isActive) {
                button.classList.remove('active');
                button.innerHTML = '<i class="far fa-heart"></i>';
                JooCourses.showFlashMessage('info', 'Removed from wishlist');
            } else {
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                JooCourses.showFlashMessage('success', 'Added to wishlist');
            }
        }
    } catch (error) {
        console.error('Wishlist error:', error);
        JooCourses.showFlashMessage('error', 'Failed to update wishlist');
    }
}

// ===== UTILITY FUNCTIONS =====
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// ===== REFRESH DASHBOARD =====
function refreshDashboard() {
    loadDashboardData();
}

// Auto-refresh every 5 minutes
setInterval(refreshDashboard, 5 * 60 * 1000);
