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
      function togglePassword() {
        const passwordField = document.getElementById('password');
        const passwordIcon = document.getElementById('password-icon');
        
        if (passwordField.type === 'password') {
          passwordField.type = 'text';
          passwordIcon.className = 'fas fa-eye-slash';
        } else {
          passwordField.type = 'password';
          passwordIcon.className = 'fas fa-eye';
        }
      }
  
      // Input validation
      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
  
      function validatePassword(password) {
        return password.length >= 6;
      }
  
      // Show/hide loading state
      function setLoadingState(loading) {
        const btn = document.getElementById('login-btn');
        const spinner = document.getElementById('loading-spinner');
        const icon = document.getElementById('login-icon');
        const text = document.getElementById('btn-text');
        
        if (loading) {
          btn.disabled = true;
          spinner.style.display = 'block';
          icon.style.display = 'none';
          text.textContent = 'Signing In...';
        } else {
          btn.disabled = false;
          spinner.style.display = 'none';
          icon.style.display = 'block';
          text.textContent = 'Sign In';
        }
      }
  
      // Show error/success messages
      function showMessage(type, message) {
        const errorDiv = document.getElementById('login-error');
        const successDiv = document.getElementById('login-success');
        
        if (type === 'error') {
          errorDiv.textContent = message;
          errorDiv.style.display = 'block';
          successDiv.style.display = 'none';
        } else {
          successDiv.textContent = message;
          successDiv.style.display = 'block';
          errorDiv.style.display = 'none';
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          errorDiv.style.display = 'none';
          successDiv.style.display = 'none';
        }, 5000);
      }
  
      // Handle login form submission
      document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Hide previous messages
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('login-success').style.display = 'none';
  
        // Client-side validation
        if (!email || !password) {
          showMessage('error', "Please enter both email and password.");
          return;
        }
  
        if (!validateEmail(email)) {
          showMessage('error', "Please enter a valid email address.");
          return;
        }
  
        if (!validatePassword(password)) {
          showMessage('error', "Password must be at least 6 characters long.");
          return;
        }
  
        setLoadingState(true);
  
        try {
          const response = await fetch('https://localhost:5000/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, remember })
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.message || "Login failed. Please try again.");
          }
  
          // Store tokens securely
          const tokenExpiry = remember ? 7 : 0.25; // 7 days or 6 hours
          setCookie('accessToken', data.accessToken, tokenExpiry);
          
          if (data.refreshToken) {
            setCookie('refreshToken', data.refreshToken, 30); // 30 days
          }
  
          // Store user info (consider encryption for sensitive data)
          sessionStorage.setItem('user', JSON.stringify(data.user));
  
          showMessage('success', "Login successful! Redirecting to your dashboard...");
  
          // Redirect based on user role
          setTimeout(() => {
            const redirectMap = {
              'student': '/Student_Dashboard',
              'instructor': '/instructor_Dashboard', 
              'manager': '/manager_Dashboard' 
            };
            
            const redirectUrl = redirectMap[data.user.role] || '/dashboard';
            window.location.href = redirectUrl;
          }, 1500);
  
        } catch (error) {
          console.error('Login error:', error);
          showMessage('error', error.message || "Network error. Please check your connection and try again.");
        } finally {
          setLoadingState(false);
        }
      });
  
      // Social login placeholder
      function socialLogin(provider) {
        showMessage('error', `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not available yet. Please use email/password.`);
      }
  
      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        // Focus email field on Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('email').focus();
        }
        
        // Focus password field on Ctrl+L or Cmd+L
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
          e.preventDefault();
          document.getElementById('password').focus();
        }
      });
  
      // Real-time validation feedback
      document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
          this.style.borderColor = '#ef4444';
          showMessage('error', 'Please enter a valid email address.');
        } else {
          this.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      });
  
      document.getElementById('password').addEventListener('blur', function() {
        const password = this.value;
        if (password && !validatePassword(password)) {
          this.style.borderColor = '#ef4444';
          showMessage('error', 'Password must be at least 6 characters long.');
        } else {
          this.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      });
  
      // Auto-focus first input
      window.addEventListener('load', function() {
        document.getElementById('email').focus();
      });
  
      // Prevent form resubmission on page refresh
      if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
      }