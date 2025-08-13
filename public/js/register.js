// ===== REGISTER PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterForm();
    initializePasswordToggles();
    initializePasswordStrength();
});

// ===== FORM INITIALIZATION =====
function initializeRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const roleSelect = document.getElementById('role');
    const termsCheckbox = document.getElementById('terms');

    // Add event listeners
    if (nameInput) {
        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('input', clearError);
    }

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearError);
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', validatePhone);
        phoneInput.addEventListener('input', clearError);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
        passwordInput.addEventListener('blur', validatePassword);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
        confirmPasswordInput.addEventListener('input', clearError);
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', validateRole);
    }

    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', validateTerms);
    }

    // Form submission
    form.addEventListener('submit', handleRegisterSubmit);
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

// ===== PASSWORD STRENGTH =====
function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthContainer = document.getElementById('password-strength');

    if (passwordInput && strengthContainer) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(passwordInput.value, strengthContainer);
        });
    }
}

function updatePasswordStrength(password, container) {
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

// ===== VALIDATION FUNCTIONS =====
function validateName() {
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    const name = nameInput.value.trim();

    if (!name) {
        showFieldError(nameInput, nameError, 'Name is required');
        return false;
    }

    if (name.length < 2) {
        showFieldError(nameInput, nameError, 'Name must be at least 2 characters');
        return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
        showFieldError(nameInput, nameError, 'Name can only contain letters and spaces');
        return false;
    }

    clearFieldError(nameInput, nameError);
    return true;
}

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

function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    const phone = phoneInput.value.trim();

    // Phone is optional, so if empty, it's valid
    if (!phone) {
        clearFieldError(phoneInput, phoneError);
        return true;
    }

    // Basic phone validation (adjust regex as needed)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        showFieldError(phoneInput, phoneError, 'Please enter a valid phone number');
        return false;
    }

    clearFieldError(phoneInput, phoneError);
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
    return true;
}

function validateRole() {
    const roleSelect = document.getElementById('role');
    const roleError = document.getElementById('role-error');
    const role = roleSelect.value;

    if (!role) {
        showFieldError(roleSelect, roleError, 'Please select your role');
        return false;
    }

    clearFieldError(roleSelect, roleError);
    return true;
}

function validateTerms() {
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('terms-error');

    if (!termsCheckbox.checked) {
        showFieldError(termsCheckbox, termsError, 'You must agree to the terms and conditions');
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

// ===== FORM SUBMISSION =====
async function handleRegisterSubmit(e) {
    // Only prevent default if validation fails
    if (!validateForm()) {
        e.preventDefault();
        return;
    }

    // Show loading state
    const form = e.target;
    const submitBtn = form.querySelector('.auth-submit');
    setButtonLoading(submitBtn, true);

    // Let the form submit normally to the web endpoint
    // The server will handle the response and redirect
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
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}
