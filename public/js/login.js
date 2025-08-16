// ===== MODERN LOGIN PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializePasswordToggle();
    initializeRememberMe();
    initializeFormAnimations();
    initializeAccessibility();
});

// ===== FORM INITIALIZATION =====
function initializeLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Real-time validation with enhanced feedback
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', handleEmailInput);
        emailInput.addEventListener('focus', handleInputFocus);
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', handlePasswordInput);
        passwordInput.addEventListener('focus', handleInputFocus);
    }

    // Form submission
    form.addEventListener('submit', handleLoginSubmit);
}

// ===== INPUT HANDLERS =====
function handleInputFocus(e) {
    const input = e.target;
    const wrapper = input.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.add('focused');
    }
    clearFieldError(input);
}

function handleEmailInput(e) {
    const input = e.target;
    clearFieldError(input);

    // Real-time email validation feedback
    if (input.value.length > 0) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        if (isValid) {
            input.classList.add('valid');
            input.classList.remove('error');
        } else {
            input.classList.remove('valid');
        }
    }
}

function handlePasswordInput(e) {
    const input = e.target;
    clearFieldError(input);

    // Real-time password validation feedback
    if (input.value.length > 0) {
        if (input.value.length >= 6) {
            input.classList.add('valid');
            input.classList.remove('error');
        } else {
            input.classList.remove('valid');
        }
    }
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

// ===== ENHANCED VALIDATION FUNCTIONS =====
function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const email = emailInput.value.trim();

    if (!email) {
        showFieldError(emailInput, emailError, 'Email address is required');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError(emailInput, emailError, 'Please enter a valid email address');
        return false;
    }

    clearFieldError(emailInput, emailError);
    emailInput.classList.add('valid');
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
        showFieldError(passwordInput, passwordError, 'Password must be at least 6 characters long');
        return false;
    }

    clearFieldError(passwordInput, passwordError);
    passwordInput.classList.add('valid');
    return true;
}

function validateForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    return isEmailValid && isPasswordValid;
}

// ===== ENHANCED FORM SUBMISSION =====
async function handleLoginSubmit(e) {
    e.preventDefault();

    // Add form submission animation
    const form = e.target;
    form.classList.add('submitting');

    if (!validateForm()) {
        form.classList.remove('submitting');
        // Focus on first error field
        const errorField = form.querySelector('.form-input.error');
        if (errorField) {
            errorField.focus();
            errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    const submitBtn = form.querySelector('.submit-btn');
    const formData = new FormData(form);

    try {
        // Show loading state with enhanced animation
        setButtonLoading(submitBtn, true);

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                remember: formData.get('remember') ? true : false
            })
        });

        const result = await response.json();

        if (result.success) {
            // Success animation
            submitBtn.classList.add('success');
            showSuccessMessage('Login successful! Redirecting...');

            // Handle remember me
            handleRememberMe(formData.get('email'), formData.get('remember'));

            // Redirect based on user role with delay for animation
            setTimeout(() => {
                const user = result.data.user;
                if (user.role === 'instructor') {
                    window.location.href = '/instructor/dashboard';
                } else if (user.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/student/dashboard';
                }
            }, 1500);
        } else {
            showErrorMessage(result.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('Network error. Please check your connection and try again.');
    } finally {
        setTimeout(() => {
            setButtonLoading(submitBtn, false);
            form.classList.remove('submitting');
        }, 500);
    }
}

// ===== ENHANCED UTILITY FUNCTIONS =====
function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    input.classList.remove('valid');

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');

        // Add shake animation
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }

    // Add error styling to wrapper
    const wrapper = input.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.add('error');
    }
}

function clearFieldError(input, errorElement) {
    input.classList.remove('error');

    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    // Remove error styling from wrapper
    const wrapper = input.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.remove('error');
    }
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// ===== MESSAGE FUNCTIONS =====
function showSuccessMessage(message) {
    // Create or update success message
    let messageEl = document.querySelector('.success-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'success-message';
        document.querySelector('.modern-form').prepend(messageEl);
    }

    messageEl.textContent = message;
    messageEl.classList.add('show');

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

function showErrorMessage(message) {
    // Create or update error message
    let messageEl = document.querySelector('.form-error-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-error-message';
        document.querySelector('.modern-form').prepend(messageEl);
    }

    messageEl.textContent = message;
    messageEl.classList.add('show');

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

// ===== FORM ANIMATIONS =====
function initializeFormAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .success-message, .form-error-message {
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-lg);
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            opacity: 0;
            transform: translateY(-10px);
            transition: all var(--transition-normal);
        }

        .success-message {
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            color: #1e40af;
        }

        .form-error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }

        .success-message.show, .form-error-message.show {
            opacity: 1;
            transform: translateY(0);
        }

        .submit-btn.success {
            background: linear-gradient(135deg, var(--success), var(--success-dark));
        }

        .modern-form.submitting {
            pointer-events: none;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Add ARIA labels and descriptions
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    if (emailInput && emailError) {
        emailInput.setAttribute('aria-describedby', 'email-error');
        emailError.setAttribute('role', 'alert');
        emailError.setAttribute('aria-live', 'polite');
    }

    if (passwordInput && passwordError) {
        passwordInput.setAttribute('aria-describedby', 'password-error');
        passwordError.setAttribute('role', 'alert');
        passwordError.setAttribute('aria-live', 'polite');
    }

    // Keyboard navigation for custom elements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const target = e.target;

            // Handle custom checkbox
            if (target.type === 'checkbox' && target.closest('.custom-checkbox')) {
                target.click();
            }

            // Handle form submission
            if (target.closest('.modern-form') && target.tagName !== 'BUTTON') {
                const form = document.getElementById('login-form');
                if (form) {
                    e.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            }
        }
    });
}

// ===== ENHANCED REMEMBER ME =====
function handleRememberMe(email, remember) {
    if (remember) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
}

function initializeRememberMe() {
    const rememberCheckbox = document.getElementById('remember');
    const emailInput = document.getElementById('email');

    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        emailInput.dispatchEvent(new Event('input')); // Trigger validation
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
}

// ===== SOCIAL LOGIN =====
function handleSocialLogin(provider) {
    const socialBtn = document.querySelector(`.${provider}-btn`);
    if (socialBtn) {
        socialBtn.classList.add('loading');
        socialBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    }

    setTimeout(() => {
        window.location.href = `/auth/${provider}`;
    }, 500);
}

// ===== FLASH MESSAGE SYSTEM =====
function createFlashMessage(type, message) {
    // Create flash messages container if it doesn't exist
    let container = document.querySelector('.flash-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
    }

    // Create flash message element
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;

    // Set icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        case 'info':
            icon = 'fas fa-info-circle';
            break;
        default:
            icon = 'fas fa-info-circle';
    }

    flashMessage.innerHTML = `
        <div class="flash-message-icon">
            <i class="${icon}"></i>
        </div>
        <div class="flash-message-content">${message}</div>
        <button type="button" class="flash-message-close" onclick="removeFlashMessage(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(flashMessage);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeFlashMessage(flashMessage.querySelector('.flash-message-close'));
    }, 5000);

    return flashMessage;
}

function removeFlashMessage(closeBtn) {
    const flashMessage = closeBtn.closest('.flash-message');
    if (flashMessage) {
        flashMessage.classList.add('fade-out');
        setTimeout(() => {
            flashMessage.remove();
        }, 300);
    }
}

// ===== INITIALIZE EXISTING FLASH MESSAGES =====
document.addEventListener('DOMContentLoaded', function() {
    // Handle existing flash messages from server
    const existingMessages = document.querySelectorAll('.alert');
    existingMessages.forEach(alert => {
        let type = 'info';
        if (alert.classList.contains('alert-success')) type = 'success';
        else if (alert.classList.contains('alert-error')) type = 'error';
        else if (alert.classList.contains('alert-warning')) type = 'warning';

        const message = alert.textContent.trim();
        createFlashMessage(type, message);
        alert.remove();
    });
});
