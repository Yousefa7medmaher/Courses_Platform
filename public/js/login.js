// ===== LOGIN PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializePasswordToggle();
});

// ===== FORM INITIALIZATION =====
function initializeLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Real-time validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearError);
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', clearError);
    }

    // Form submission
    form.addEventListener('submit', handleLoginSubmit);
}

// ===== PASSWORD TOGGLE =====
function initializePasswordToggle() {
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = passwordToggle.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }
}

// ===== VALIDATION FUNCTIONS =====
function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const email = emailInput.value.trim();

    if (!email) {
        showFieldError(emailInput, emailError, 'Email is required');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError(emailInput, emailError, 'Please enter a valid email address');
        return false;
    }

    clearFieldError(emailInput, emailError);
    return true;
}

function validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const password = passwordInput.value;

    if (!password) {
        showFieldError(passwordInput, passwordError, 'Password is required');
        return false;
    }

    if (password.length < 6) {
        showFieldError(passwordInput, passwordError, 'Password must be at least 6 characters');
        return false;
    }

    clearFieldError(passwordInput, passwordError);
    return true;
}

function validateForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    return isEmailValid && isPasswordValid;
}

// ===== FORM SUBMISSION =====
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('.auth-submit');
    const formData = new FormData(form);

    try {
        // Show loading state
        setButtonLoading(submitBtn, true);
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const result = await response.json();

        if (result.success) {
            JooCourses.showFlashMessage('success', result.message);
            
            // Redirect based on user role
            setTimeout(() => {
                const user = result.data.user;
                if (user.role === 'instructor') {
                    window.location.href = '/instructor/dashboard';
                } else if (user.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/student/dashboard';
                }
            }, 1000);
        } else {
            JooCourses.showFlashMessage('error', result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        JooCourses.showFlashMessage('error', 'Login failed. Please try again.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ===== UTILITY FUNCTIONS =====
function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(input, errorElement) {
    input.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function clearError(e) {
    const input = e.target;
    const errorElement = document.getElementById(input.id + '-error');
    clearFieldError(input, errorElement);
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// ===== SOCIAL LOGIN =====
function handleSocialLogin(provider) {
    JooCourses.showLoading();
    window.location.href = `/auth/${provider}`;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Enter key to submit form
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const form = document.getElementById('login-form');
        if (form && document.activeElement && form.contains(document.activeElement)) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// ===== REMEMBER ME FUNCTIONALITY =====
function initializeRememberMe() {
    const rememberCheckbox = document.getElementById('remember');
    const emailInput = document.getElementById('email');

    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }

    // Save/remove email based on remember me checkbox
    if (rememberCheckbox && emailInput) {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', function() {
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        });
    }
}

// Initialize remember me functionality
document.addEventListener('DOMContentLoaded', initializeRememberMe);
