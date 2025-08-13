// ===== FORM VALIDATION UTILITIES =====

// ===== VALIDATION RULES =====
const ValidationRules = {
    required: {
        test: (value) => value && value.toString().trim().length > 0,
        message: 'This field is required'
    },
    
    email: {
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
    },
    
    minLength: (min) => ({
        test: (value) => value && value.length >= min,
        message: `Must be at least ${min} characters long`
    }),
    
    maxLength: (max) => ({
        test: (value) => !value || value.length <= max,
        message: `Must be no more than ${max} characters long`
    }),
    
    password: {
        test: (value) => value && value.length >= 6,
        message: 'Password must be at least 6 characters long'
    },
    
    strongPassword: {
        test: (value) => {
            if (!value) return false;
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            const hasLength = value.length >= 8;
            
            return hasUpper && hasLower && hasNumber && hasSpecial && hasLength;
        },
        message: 'Password must contain uppercase, lowercase, number, special character, and be 8+ characters'
    },
    
    phone: {
        test: (value) => !value || /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
        message: 'Please enter a valid phone number'
    },
    
    url: {
        test: (value) => {
            if (!value) return true; // Optional field
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        message: 'Please enter a valid URL'
    },
    
    number: {
        test: (value) => !value || !isNaN(parseFloat(value)),
        message: 'Please enter a valid number'
    },
    
    positiveNumber: {
        test: (value) => !value || (parseFloat(value) >= 0),
        message: 'Please enter a positive number'
    },
    
    match: (fieldName) => ({
        test: (value, form) => {
            const matchField = form.querySelector(`[name="${fieldName}"]`);
            return matchField && value === matchField.value;
        },
        message: `Must match ${fieldName}`
    })
};

// ===== FORM VALIDATOR CLASS =====
class FormValidator {
    constructor(form, rules = {}) {
        this.form = form;
        this.rules = rules;
        this.errors = {};
        this.isValid = true;
        
        this.initialize();
    }
    
    initialize() {
        // Add event listeners for real-time validation
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
        
        // Add form submit handler
        this.form.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
            }
        });
    }
    
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        const rules = this.rules[fieldName];
        
        if (!field || !rules) return true;
        
        const value = field.value;
        
        for (const rule of rules) {
            if (!rule.test(value, this.form)) {
                this.showFieldError(fieldName, rule.message);
                return false;
            }
        }
        
        this.clearFieldError(fieldName);
        return true;
    }
    
    validateAll() {
        this.isValid = true;
        this.errors = {};
        
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                this.isValid = false;
            }
        });
        
        return this.isValid;
    }
    
    showFieldError(fieldName, message) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        const errorElement = this.form.querySelector(`#${fieldName}-error`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        this.errors[fieldName] = message;
    }
    
    clearFieldError(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        const errorElement = this.form.querySelector(`#${fieldName}-error`);
        
        if (field) {
            field.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        delete this.errors[fieldName];
    }
    
    clearAllErrors() {
        Object.keys(this.rules).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });
        this.errors = {};
    }
    
    getErrors() {
        return this.errors;
    }
    
    isFormValid() {
        return this.isValid && Object.keys(this.errors).length === 0;
    }
}

// ===== COMMON VALIDATION PATTERNS =====
const CommonValidations = {
    loginForm: {
        email: [ValidationRules.required, ValidationRules.email],
        password: [ValidationRules.required]
    },
    
    registerForm: {
        name: [ValidationRules.required, ValidationRules.minLength(2)],
        email: [ValidationRules.required, ValidationRules.email],
        phone: [ValidationRules.phone],
        password: [ValidationRules.required, ValidationRules.password],
        confirmPassword: [ValidationRules.required, ValidationRules.match('password')],
        role: [ValidationRules.required]
    },
    
    profileForm: {
        firstName: [ValidationRules.required, ValidationRules.minLength(2)],
        lastName: [ValidationRules.required, ValidationRules.minLength(2)],
        email: [ValidationRules.required, ValidationRules.email],
        phone: [ValidationRules.phone],
        bio: [ValidationRules.maxLength(1000)],
        website: [ValidationRules.url],
        linkedin: [ValidationRules.url]
    },
    
    passwordForm: {
        currentPassword: [ValidationRules.required],
        newPassword: [ValidationRules.required, ValidationRules.strongPassword],
        confirmPassword: [ValidationRules.required, ValidationRules.match('newPassword')]
    },
    
    courseForm: {
        title: [ValidationRules.required, ValidationRules.minLength(5), ValidationRules.maxLength(100)],
        description: [ValidationRules.required, ValidationRules.minLength(20), ValidationRules.maxLength(2000)],
        category: [ValidationRules.required],
        level: [ValidationRules.required],
        price: [ValidationRules.required, ValidationRules.positiveNumber]
    }
};

// ===== VALIDATION HELPERS =====
function validateForm(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const validator = new FormValidator(form, validationRules);
    return validator.validateAll();
}

function initializeFormValidation(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return null;
    
    return new FormValidator(form, validationRules);
}

// ===== REAL-TIME VALIDATION =====
function addRealTimeValidation(fieldId, rules) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.addEventListener('blur', function() {
        validateSingleField(this, rules);
    });
    
    field.addEventListener('input', function() {
        clearSingleFieldError(this);
    });
}

function validateSingleField(field, rules) {
    const value = field.value;
    
    for (const rule of rules) {
        if (!rule.test(value, field.form)) {
            showSingleFieldError(field, rule.message);
            return false;
        }
    }
    
    clearSingleFieldError(field);
    return true;
}

function showSingleFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.getElementById(field.name + '-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearSingleFieldError(field) {
    field.classList.remove('error');
    
    const errorElement = document.getElementById(field.name + '-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// ===== PASSWORD STRENGTH CHECKER =====
function checkPasswordStrength(password) {
    let score = 0;
    const feedback = [];
    
    // Length check
    if (password.length >= 8) {
        score += 1;
    } else {
        feedback.push('Use at least 8 characters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add uppercase letters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add lowercase letters');
    }
    
    // Number check
    if (/\d/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add numbers');
    }
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add special characters');
    }
    
    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';
    
    return {
        score,
        strength,
        feedback,
        isStrong: score >= 4
    };
}

// ===== FORM SERIALIZATION =====
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (checkboxes, etc.)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

// ===== EXPORT TO GLOBAL SCOPE =====
if (typeof window !== 'undefined') {
    window.JooCourses = window.JooCourses || {};
    
    Object.assign(window.JooCourses, {
        ValidationRules,
        FormValidator,
        CommonValidations,
        validateForm,
        initializeFormValidation,
        addRealTimeValidation,
        checkPasswordStrength,
        serializeForm
    });
}
