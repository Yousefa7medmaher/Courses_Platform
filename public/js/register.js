// ===== MODERN REGISTER PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterForm();
    initializePasswordToggles();
    initializePasswordStrength();
    initializeRoleSelection();
    initializeFormAnimations();
    initializeAccessibility();
});

// ===== FORM INITIALIZATION =====
function initializeRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    // Enhanced real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');

    // Add enhanced event listeners
    if (nameInput) {
        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('input', handleNameInput);
        nameInput.addEventListener('focus', handleInputFocus);
    }

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', handleEmailInput);
        emailInput.addEventListener('focus', handleInputFocus);
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', validatePhone);
        phoneInput.addEventListener('input', handlePhoneInput);
        phoneInput.addEventListener('focus', handleInputFocus);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', handlePasswordInput);
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('focus', handleInputFocus);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
        confirmPasswordInput.addEventListener('input', handleConfirmPasswordInput);
        confirmPasswordInput.addEventListener('focus', handleInputFocus);
    }

    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', validateTerms);
    }

    // Form submission
    form.addEventListener('submit', handleRegisterSubmit);
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

function handleNameInput(e) {
    const input = e.target;
    clearFieldError(input);

    if (input.value.length > 0) {
        if (input.value.length >= 2 && /^[a-zA-Z\s]+$/.test(input.value)) {
            input.classList.add('valid');
            input.classList.remove('error');
        } else {
            input.classList.remove('valid');
        }
    }
}

function handleEmailInput(e) {
    const input = e.target;
    clearFieldError(input);

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

function handlePhoneInput(e) {
    const input = e.target;
    clearFieldError(input);

    // Format phone number as user types
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
        input.value = value;

        if (value.length >= 14) {
            input.classList.add('valid');
        }
    }
}

function handlePasswordInput(e) {
    const input = e.target;
    clearFieldError(input);
    updatePasswordStrength(input.value);

    if (input.value.length > 0) {
        if (input.value.length >= 6) {
            input.classList.add('valid');
            input.classList.remove('error');
        } else {
            input.classList.remove('valid');
        }
    }

    // Also validate confirm password if it has a value
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput && confirmInput.value) {
        validateConfirmPassword();
    }
}

function handleConfirmPasswordInput(e) {
    const input = e.target;
    clearFieldError(input);

    const passwordInput = document.getElementById('password');
    if (input.value.length > 0 && passwordInput.value) {
        if (input.value === passwordInput.value) {
            input.classList.add('valid');
            input.classList.remove('error');
        } else {
            input.classList.remove('valid');
        }
    }
}

// ===== PASSWORD TOGGLES =====
function initializePasswordToggles() {
    const passwordToggle = document.getElementById('password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, passwordToggle);
        });
    }

    if (confirmPasswordToggle && confirmPasswordInput) {
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
        });
    }
}

function togglePasswordVisibility(input, toggle) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    const icon = toggle.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// ===== ROLE SELECTION =====
function initializeRoleSelection() {
    const roleOptions = document.querySelectorAll('input[name="role"]');

    roleOptions.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove active class from all role cards
            document.querySelectorAll('.role-card').forEach(card => {
                card.classList.remove('active');
            });

            // Add active class to selected role card
            if (this.checked) {
                const roleCard = this.nextElementSibling;
                if (roleCard) {
                    roleCard.classList.add('active');
                }
            }

            validateRole();
        });

        // Handle keyboard navigation
        radio.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.checked = true;
                this.dispatchEvent(new Event('change'));
            }
        });
    });
}

// ===== ENHANCED PASSWORD STRENGTH =====
function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthContainer = document.getElementById('password-strength');

    if (passwordInput && strengthContainer) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(passwordInput.value);
        });
    }
}

function updatePasswordStrength(password) {
    const container = document.getElementById('password-strength');
    if (!container) return;

    if (!password) {
        container.classList.remove('visible');
        return;
    }

    container.classList.add('visible');

    const strength = calculatePasswordStrength(password);
    const strengthClass = getStrengthClass(strength.score);

    container.innerHTML = `
        <div class="strength-bar ${strengthClass}">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">${strength.text}</div>
    `;

    // Add requirements list for weak passwords
    if (strength.score < 3 && strength.feedback.length > 0) {
        const requirementsList = document.createElement('div');
        requirementsList.className = 'password-requirements';
        requirementsList.innerHTML = `
            <div class="requirements-title">Password should include:</div>
            <ul class="requirements-list">
                ${strength.feedback.map(req => `<li>${req}</li>`).join('')}
            </ul>
        `;
        container.appendChild(requirementsList);
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('at least 8 characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('uppercase letter');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('lowercase letter');

    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('number');

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('special character');

    let text = '';
    if (score < 3) {
        text = 'Weak password';
    } else if (score < 4) {
        text = 'Medium strength';
    } else {
        text = 'Strong password';
    }

    return { score, text, feedback };
}

function getStrengthClass(score) {
    if (score < 3) return 'strength-weak';
    if (score < 4) return 'strength-medium';
    return 'strength-strong';
}

// ===== ENHANCED VALIDATION FUNCTIONS =====
function validateName() {
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    const name = nameInput.value.trim();

    if (!name) {
        showFieldError(nameInput, nameError, 'Full name is required');
        return false;
    }

    if (name.length < 2) {
        showFieldError(nameInput, nameError, 'Name must be at least 2 characters long');
        return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
        showFieldError(nameInput, nameError, 'Name can only contain letters and spaces');
        return false;
    }

    clearFieldError(nameInput, nameError);
    nameInput.classList.add('valid');
    return true;
}

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

function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    const phone = phoneInput.value.trim();

    // Phone is optional, so if empty, it's valid
    if (!phone) {
        clearFieldError(phoneInput, phoneError);
        return true;
    }

    // Enhanced phone validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
        showFieldError(phoneInput, phoneError, 'Please enter a valid phone number');
        return false;
    }

    clearFieldError(phoneInput, phoneError);
    phoneInput.classList.add('valid');
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

    // Check password strength
    const strength = calculatePasswordStrength(password);
    if (strength.score < 2) {
        showFieldError(passwordInput, passwordError, 'Password is too weak. Please create a stronger password.');
        return false;
    }

    clearFieldError(passwordInput, passwordError);
    passwordInput.classList.add('valid');
    return true;
}

function validateConfirmPassword() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
        showFieldError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
        return false;
    }

    if (password !== confirmPassword) {
        showFieldError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
        return false;
    }

    clearFieldError(confirmPasswordInput, confirmPasswordError);
    confirmPasswordInput.classList.add('valid');
    return true;
}

function validateRole() {
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const roleError = document.getElementById('role-error');
    const selectedRole = document.querySelector('input[name="role"]:checked');

    if (!selectedRole) {
        showFieldError(roleInputs[0], roleError, 'Please select your role');
        return false;
    }

    clearFieldError(roleInputs[0], roleError);
    return true;
}

function validateTerms() {
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('terms-error');

    if (!termsCheckbox.checked) {
        showFieldError(termsCheckbox, termsError, 'You must agree to the Terms of Service and Privacy Policy');
        return false;
    }

    clearFieldError(termsCheckbox, termsError);
    return true;
}

function validateForm() {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isRoleValid = validateRole();
    const isTermsValid = validateTerms();

    return isNameValid && isEmailValid && isPhoneValid && isPasswordValid &&
           isConfirmPasswordValid && isRoleValid && isTermsValid;
}

// ===== ENHANCED FORM SUBMISSION =====
async function handleRegisterSubmit(e) {
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
    setButtonLoading(submitBtn, true);

    // Let the form submit normally to the web endpoint
    // Add a small delay for better UX
    setTimeout(() => {
        form.submit();
    }, 500);
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

// ===== FORM ANIMATIONS =====
function initializeFormAnimations() {
    // Add CSS for animations (similar to login.js)
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

        .modern-form.submitting {
            pointer-events: none;
            opacity: 0.8;
        }

        .password-requirements {
            margin-top: var(--spacing-sm);
            padding: var(--spacing-sm);
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            border-left: 3px solid var(--warning);
        }

        .requirements-title {
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
        }

        .requirements-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .requirements-list li {
            font-size: var(--font-size-xs);
            color: var(--text-muted);
            padding: 2px 0;
            position: relative;
            padding-left: var(--spacing-md);
        }

        .requirements-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--warning);
        }
    `;
    document.head.appendChild(style);
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Add ARIA labels and descriptions
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];

    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(`${inputId}-error`);

        if (input && error) {
            input.setAttribute('aria-describedby', `${inputId}-error`);
            error.setAttribute('role', 'alert');
            error.setAttribute('aria-live', 'polite');
        }
    });

    // Role selection accessibility
    const roleInputs = document.querySelectorAll('input[name="role"]');
    roleInputs.forEach(input => {
        input.setAttribute('aria-describedby', 'role-error');
    });

    // Terms checkbox accessibility
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('terms-error');
    if (termsCheckbox && termsError) {
        termsCheckbox.setAttribute('aria-describedby', 'terms-error');
        termsError.setAttribute('role', 'alert');
        termsError.setAttribute('aria-live', 'polite');
    }
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
