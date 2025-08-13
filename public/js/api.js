// ===== API UTILITY FUNCTIONS =====

// Global API configuration
const API_CONFIG = {
    baseURL: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

// ===== MAIN API FUNCTION =====
async function apiCall(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseURL}${endpoint}`;
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        finalOptions.headers['X-CSRF-Token'] = csrfToken.getAttribute('content');
    }

    let lastError;
    
    for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            finalOptions.signal = controller.signal;
            
            const response = await fetch(url, finalOptions);
            clearTimeout(timeoutId);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new APIError(data.message || `HTTP ${response.status}`, response.status, data);
            }

            return data;
            
        } catch (error) {
            lastError = error;
            
            // Don't retry on certain errors
            if (error.name === 'AbortError' || 
                error.status === 401 || 
                error.status === 403 || 
                error.status === 404 ||
                attempt === API_CONFIG.retryAttempts) {
                break;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
        }
    }
    
    // Handle specific error cases
    if (lastError.status === 401) {
        handleUnauthorized();
    } else if (lastError.status === 403) {
        handleForbidden();
    } else if (lastError.status === 429) {
        handleRateLimit();
    }
    
    throw lastError;
}

// ===== CUSTOM ERROR CLASS =====
class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// ===== ERROR HANDLERS =====
function handleUnauthorized() {
    JooCourses.showFlashMessage('error', 'Your session has expired. Please log in again.');
    setTimeout(() => {
        window.location.href = '/login';
    }, 2000);
}

function handleForbidden() {
    JooCourses.showFlashMessage('error', 'You do not have permission to perform this action.');
}

function handleRateLimit() {
    JooCourses.showFlashMessage('warning', 'Too many requests. Please wait a moment and try again.');
}

// ===== SPECIFIC API ENDPOINTS =====

// Authentication APIs
const AuthAPI = {
    async login(credentials) {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async register(userData) {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async logout() {
        return apiCall('/auth/logout', {
            method: 'POST'
        });
    },

    async forgotPassword(email) {
        return apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    async resetPassword(token, password) {
        return apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password })
        });
    }
};

// Course APIs
const CourseAPI = {
    async getCourses(filters = {}) {
        const params = new URLSearchParams(filters);
        return apiCall(`/courses?${params}`);
    },

    async getCourse(courseId) {
        return apiCall(`/courses/${courseId}`);
    },

    async enrollInCourse(courseId) {
        return apiCall(`/courses/${courseId}/enroll`, {
            method: 'POST'
        });
    },

    async rateCourse(courseId, rating, review) {
        return apiCall(`/courses/${courseId}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating, review })
        });
    },

    async createCourse(courseData) {
        return apiCall('/instructor/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    },

    async updateCourse(courseId, courseData) {
        return apiCall(`/instructor/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(courseData)
        });
    },

    async deleteCourse(courseId) {
        return apiCall(`/instructor/courses/${courseId}`, {
            method: 'DELETE'
        });
    }
};

// User APIs
const UserAPI = {
    async getProfile() {
        return apiCall('/profile');
    },

    async updateProfile(profileData) {
        return apiCall('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async updatePassword(passwordData) {
        return apiCall('/profile/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    },

    async uploadPhoto(file) {
        const formData = new FormData();
        formData.append('photo', file);
        
        return apiCall('/profile/photo', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set content-type for FormData
        });
    }
};

// Wishlist APIs
const WishlistAPI = {
    async getWishlist() {
        return apiCall('/wishlist');
    },

    async addToWishlist(courseId) {
        return apiCall(`/wishlist/${courseId}`, {
            method: 'POST'
        });
    },

    async removeFromWishlist(courseId) {
        return apiCall(`/wishlist/${courseId}`, {
            method: 'DELETE'
        });
    }
};

// Analytics APIs
const AnalyticsAPI = {
    async getStudentStats() {
        return apiCall('/student/stats');
    },

    async getInstructorStats() {
        return apiCall('/instructor/stats');
    },

    async getAdminStats() {
        return apiCall('/admin/stats');
    },

    async trackEvent(eventData) {
        return apiCall('/analytics/track', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }
};

// ===== UTILITY FUNCTIONS =====

// Debounce function for search and filters
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
}

// ===== EXPORT TO GLOBAL SCOPE =====
if (typeof window !== 'undefined') {
    window.JooCourses = window.JooCourses || {};
    
    // Add API functions to global JooCourses object
    Object.assign(window.JooCourses, {
        apiCall,
        AuthAPI,
        CourseAPI,
        UserAPI,
        WishlistAPI,
        AnalyticsAPI,
        debounce,
        throttle,
        formatCurrency,
        formatDate,
        formatRelativeTime,
        APIError
    });
}
