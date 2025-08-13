    // Enhanced security cookie function
    function setCookie(name, value, days, secure = true) {
        let expires = "";
        if (days) {
          const date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
        }
        const secureFlag = secure && location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict" + secureFlag;
      }
  
      // Password visibility toggle
      function togglePassword(fieldId) {
        const passwordField = document.getElementById(fieldId);
        const passwordIcon = document.getElementById(`${fieldId}-icon`);
        
        if (passwordField.type === 'password') {
          passwordField.type = 'text';
          passwordIcon.className = 'fas fa-eye-slash';
        } else {
          passwordField.type = 'password';
          passwordIcon.className = 'fas fa-eye';
        }
      }
  
      // Input validation functions
      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
  
      function validateName(name) {
        return name.trim().length >= 2;
      }
  
      function validatePhone(phone) {
        // Allow empty phone or basic phone validation
        return !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
      }
  
      function validatePassword(password) {
        return {
          length: password.length >= 6,
          isValid: password.length >= 6
        };
      }
  
      function calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 6) score += 25;
        if (password.length >= 8) score += 15;
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/\d/.test(password)) score += 15;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
        
        return Math.min(score, 100);
      }
  
      // Password strength visualization
      function updatePasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength-bar');
        const strength = calculatePasswordStrength(password);
        const checks = validatePassword(password);
        
        // Update strength bar
        strengthBar.className = 'password-strength-bar';
        if (strength >= 80) {
          strengthBar.classList.add('strength-strong');
        } else if (strength >= 60) {
          strengthBar.classList.add('strength-good');
        } else if (strength >= 40) {
          strengthBar.classList.add('strength-fair');
        } else if (strength > 0) {
          strengthBar.classList.add('strength-weak');
        }
        
        // Update requirement indicator
        const lengthReq = document.getElementById('length-req');
        const icon = lengthReq.querySelector('i');
        
        if (checks.length) {
          lengthReq.className = 'valid';
          icon.className = 'fas fa-check';
        } else {
          lengthReq.className = 'invalid';
          icon.className = 'fas fa-times';
        }
      }
  
      // Show/hide loading state
      function setLoadingState(loading) {
        const btn = document.getElementById('register-btn');
        const spinner = document.getElementById('loading-spinner');
        const icon = document.getElementById('register-icon');
        const text = document.getElementById('btn-text');
        
        if (loading) {
          btn.disabled = true;
          spinner.style.display = 'block';
          icon.style.display = 'none';
          text.textContent = 'Creating Account...';
        } else {
          btn.disabled = false;
          spinner.style.display = 'none';
          icon.style.display = 'block';
          text.textContent = 'Create Account';
        }
      }
  
      // Show error/success messages
      function showMessage(type, message) {
        const errorDiv = document.getElementById('register-error');
        const successDiv = document.getElementById('register-success');
        
        if (type === 'error') {
          errorDiv.textContent = message;
          errorDiv.style.display = 'block';
          successDiv.style.display = 'none';
        } else {
          successDiv.textContent = message;
          successDiv.style.display = 'block';
          errorDiv.style.display = 'none';
        }
        
        // Auto-hide after 8 seconds for registration
        setTimeout(() => {
          errorDiv.style.display = 'none';
          successDiv.style.display = 'none';
        }, 8000);
      }
  
      // Handle registration form submission
      document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
          name: document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          password: document.getElementById('password').value,
          terms: document.getElementById('terms').checked
        };
        
        // Hide previous messages
        document.getElementById('register-error').style.display = 'none';
        document.getElementById('register-success').style.display = 'none';
  
        // Client-side validation
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          showMessage('error', "Please fill in all required fields.");
          return;
        }
  
        if (!validateName(formData.name)) {
          showMessage('error', "Please enter a valid name (at least 2 characters).");
          document.getElementById('name').focus();
          return;
        }
  
        if (!validateEmail(formData.email)) {
          showMessage('error', "Please enter a valid email address.");
          document.getElementById('email').focus();
          return;
        }
  
        if (!validatePhone(formData.phone)) {
          showMessage('error', "Please enter a valid phone number.");
          document.getElementById('phone').focus();
          return;
        }
  
        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.isValid) {
          showMessage('error', "Password must be at least 6 characters long.");
          document.getElementById('password').focus();
          return;
        }
  
        if (!formData.terms) {
          showMessage('error', "Please accept the Terms of Service and Privacy Policy.");
          document.getElementById('terms').focus();
          return;
        }
  
        setLoadingState(true);
  
        try {
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password
            })
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.message || "Registration failed. Please try again.");
          }
  
          // Registration successful
          showMessage('success', "Account created successfully! Please check your email for verification. Redirecting to login...");
  
          // Clear form
          document.getElementById('register-form').reset();
          updatePasswordStrength('');
  
          // Redirect to login page after success
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
  
        } catch (error) {
          console.error('Registration error:', error);
          showMessage('error', error.message || "Network error. Please check your connection and try again.");
        } finally {
          setLoadingState(false);
        }
      });
  
      // Real-time validation feedback
      document.getElementById('name').addEventListener('blur', function() {
        const name = this.value.trim();
        if (name && !validateName(name)) {
          this.style.borderColor = '#ef4444';
          showMessage('error', 'Name must be at least 2 characters long.');
        } else {
          this.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      });
  
      document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
          this.style.borderColor = '#ef4444';
          showMessage('error', 'Please enter a valid email address.');
        } else {
          this.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      });
  
      document.getElementById('phone').addEventListener('blur', function() {
        const phone = this.value.trim();
        if (phone && !validatePhone(phone)) {
          this.style.borderColor = '#ef4444';
          showMessage('error', 'Please enter a valid phone number.');
        } else {
          this.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      });
  
      document.getElementById('password').addEventListener('input', function() {
        updatePasswordStrength(this.value);
      });
  
      document.getElementById('password').addEventListener('blur', function() {
        const password = this.value;
        const checks = validatePassword(password);
        if (password && !checks.isValid) {
          this.style.borderColor = '#ef4444';
        } else {
          this.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      });
  
      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        // Focus name field on Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('name').focus();
        }
        
        // Focus email field on Ctrl+E or Cmd+E
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
          e.preventDefault();
          document.getElementById('email').focus();
        }
      });
  
      // Auto-focus first input
      window.addEventListener('load', function() {
        document.getElementById('name').focus();
      });
  
      // Prevent form resubmission on page refresh
      if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
      }
  
      // Initialize password strength on page load
      updatePasswordStrength('');