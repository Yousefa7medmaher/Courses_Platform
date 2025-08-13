// ===== PROFILE PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

// ===== INITIALIZATION =====
function initializeProfile() {
    initializeNavigation();
    initializePhotoUpload();
    initializePasswordToggles();
    initializePasswordStrength();
    initializeForms();
    initializeDeleteAccount();
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navItems = document.querySelectorAll('.profile-nav-item');
    const sections = document.querySelectorAll('.profile-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Update URL hash
            window.history.replaceState(null, null, `#${targetSection}`);
        });
    });

    // Load section from URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        const navItem = document.querySelector(`[data-section="${hash}"]`);
        if (navItem) {
            navItem.click();
        }
    }
}

// ===== PHOTO UPLOAD =====
function initializePhotoUpload() {
    const photoUpload = document.getElementById('photo-upload');
    const profileImage = document.getElementById('profile-image');

    if (photoUpload) {
        photoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                uploadProfilePhoto(file);
            }
        });
    }
}

async function uploadProfilePhoto(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        JooCourses.showFlashMessage('error', 'Please select a valid image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        JooCourses.showFlashMessage('error', 'Image size must be less than 5MB');
        return;
    }

    try {
        JooCourses.showLoading();
        
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch('/api/profile/photo', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const result = await response.json();

        if (result.success) {
            // Update profile image
            const profileImage = document.getElementById('profile-image');
            if (profileImage) {
                if (profileImage.tagName === 'IMG') {
                    profileImage.src = result.data.photoUrl;
                } else {
                    profileImage.outerHTML = `<img src="${result.data.photoUrl}" alt="Profile" id="profile-image">`;
                }
            }
            
            JooCourses.showFlashMessage('success', 'Profile photo updated successfully');
        } else {
            JooCourses.showFlashMessage('error', result.message);
        }
    } catch (error) {
        console.error('Photo upload error:', error);
        JooCourses.showFlashMessage('error', 'Failed to upload photo');
    } finally {
        JooCourses.hideLoading();
    }
}

// ===== PASSWORD TOGGLES =====
function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

// ===== PASSWORD STRENGTH =====
function initializePasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    const strengthContainer = document.getElementById('password-strength');

    if (newPasswordInput && strengthContainer) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value, strengthContainer);
        });
    }
}

function updatePasswordStrength(password, container) {
    if (!password) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    
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
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    let text = '';
    if (score < 3) {
        text = 'Weak password';
    } else if (score < 4) {
        text = 'Medium strength';
    } else {
        text = 'Strong password';
    }

    return { score, text };
}

function getStrengthClass(score) {
    if (score < 3) return 'strength-weak';
    if (score < 4) return 'strength-medium';
    return 'strength-strong';
}

// ===== FORM HANDLING =====
function initializeForms() {
    // Personal info form
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
        personalForm.addEventListener('submit', handlePersonalInfoSubmit);
    }

    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }

    // Preferences form
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesSubmit);
    }

    // Notifications form
    const notificationsForm = document.getElementById('notifications-form');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', handleNotificationsSubmit);
    }

    // Instructor form
    const instructorForm = document.getElementById('instructor-form');
    if (instructorForm) {
        instructorForm.addEventListener('submit', handleInstructorSubmit);
    }
}

async function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        setButtonLoading(submitBtn, true);
        
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                phone: formData.get('phone'),
                bio: formData.get('bio'),
                location: formData.get('location')
            })
        });

        const result = await response.json();

        if (result.success) {
            JooCourses.showFlashMessage('success', 'Personal information updated successfully');

            // Update profile display
            const profileName = document.querySelector('.profile-name');
            if (profileName) {
                profileName.textContent = formData.get('name');
            }

            // Update location if provided
            const profileLocation = document.querySelector('.profile-location');
            const location = formData.get('location');
            if (location && location.trim()) {
                if (profileLocation) {
                    profileLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location}`;
                } else {
                    // Add location element if it doesn't exist
                    const profileInfo = document.querySelector('.profile-info');
                    const locationElement = document.createElement('p');
                    locationElement.className = 'profile-location';
                    locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location}`;
                    profileInfo.appendChild(locationElement);
                }
            } else if (profileLocation) {
                profileLocation.remove();
            }
        } else {
            JooCourses.showFlashMessage('error', result.message || 'Failed to update personal information');
        }
    } catch (error) {
        console.error('Error updating personal info:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to update personal information');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validate passwords match
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        JooCourses.showFlashMessage('error', 'New passwords do not match');
        return;
    }

    try {
        setButtonLoading(submitBtn, true);
        
        const response = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                currentPassword: formData.get('currentPassword'),
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            JooCourses.showFlashMessage('success', 'Password updated successfully');
            form.reset();
        } else {
            JooCourses.showFlashMessage('error', result.message || 'Failed to update password');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to update password');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function handlePreferencesSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        setButtonLoading(submitBtn, true);
        
        const preferences = {
            language: formData.get('language'),
            timezone: formData.get('timezone'),
            autoplay: formData.has('autoplay'),
            showSubtitles: formData.has('showSubtitles'),
            darkMode: formData.has('darkMode')
        };

        const response = await JooCourses.apiCall('/api/profile/preferences', {
            method: 'PUT',
            body: JSON.stringify({ preferences })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Preferences updated successfully');
            
            // Apply dark mode if changed
            if (preferences.darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    } catch (error) {
        console.error('Error updating preferences:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to update preferences');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function handleNotificationsSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        setButtonLoading(submitBtn, true);
        
        const notifications = {
            courseUpdates: formData.has('courseUpdates'),
            recommendations: formData.has('recommendations'),
            marketing: formData.has('marketing'),
            enrollments: formData.has('enrollments'),
            reviews: formData.has('reviews')
        };

        const response = await JooCourses.apiCall('/api/profile/notifications', {
            method: 'PUT',
            body: JSON.stringify({ notifications })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Notification settings updated successfully');
        }
    } catch (error) {
        console.error('Error updating notifications:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to update notification settings');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function handleInstructorSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        setButtonLoading(submitBtn, true);
        
        const instructorProfile = {
            bio: formData.get('instructorBio'),
            expertise: formData.get('expertise').split(',').map(s => s.trim()).filter(s => s),
            website: formData.get('website'),
            linkedin: formData.get('linkedin')
        };

        const response = await JooCourses.apiCall('/api/profile/instructor', {
            method: 'PUT',
            body: JSON.stringify({ instructorProfile })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Instructor profile updated successfully');
        }
    } catch (error) {
        console.error('Error updating instructor profile:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to update instructor profile');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ===== DELETE ACCOUNT =====
function initializeDeleteAccount() {
    const deleteAccountForm = document.getElementById('delete-account-form');
    
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', handleDeleteAccount);
    }
}

function deleteAccount() {
    JooCourses.openModal('delete-account-modal');
}

async function handleDeleteAccount(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validate confirmation
    const confirmation = formData.get('confirmation');
    if (confirmation !== 'DELETE') {
        JooCourses.showFlashMessage('error', 'Please type "DELETE" to confirm');
        return;
    }

    try {
        setButtonLoading(submitBtn, true);
        
        const response = await JooCourses.apiCall('/api/profile/delete', {
            method: 'DELETE',
            body: JSON.stringify({
                password: formData.get('password')
            })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Account deleted successfully');
            
            // Redirect to home page after delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to delete account');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ===== DATA DOWNLOAD =====
async function downloadData() {
    try {
        JooCourses.showLoading();
        
        const response = await fetch('/api/profile/download', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-joocourses-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            JooCourses.showFlashMessage('success', 'Data download started');
        } else {
            throw new Error('Download failed');
        }
    } catch (error) {
        console.error('Error downloading data:', error);
        JooCourses.showFlashMessage('error', 'Failed to download data');
    } finally {
        JooCourses.hideLoading();
    }
}

// ===== TWO-FACTOR AUTHENTICATION =====
function initializeTwoFactor() {
    const twoFactorToggle = document.getElementById('enable-2fa');
    
    if (twoFactorToggle) {
        twoFactorToggle.addEventListener('change', function() {
            if (this.checked) {
                enable2FA();
            } else {
                disable2FA();
            }
        });
    }
}

async function enable2FA() {
    try {
        const response = await JooCourses.apiCall('/api/profile/2fa/enable', {
            method: 'POST'
        });

        if (response.success) {
            // Show QR code modal for setup
            show2FASetupModal(response.data.qrCode, response.data.secret);
        }
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        JooCourses.showFlashMessage('error', 'Failed to enable 2FA');
        
        // Reset toggle
        document.getElementById('enable-2fa').checked = false;
    }
}

async function disable2FA() {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) {
        document.getElementById('enable-2fa').checked = true;
        return;
    }

    try {
        const response = await JooCourses.apiCall('/api/profile/2fa/disable', {
            method: 'POST'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Two-factor authentication disabled');
        }
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        JooCourses.showFlashMessage('error', 'Failed to disable 2FA');
        
        // Reset toggle
        document.getElementById('enable-2fa').checked = true;
    }
}

function show2FASetupModal(qrCode, secret) {
    // Implementation for 2FA setup modal
    // This would show QR code and backup codes
}

// ===== UTILITY FUNCTIONS =====
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        JooCourses.showFlashMessage('info', 'Form reset to original values');
    }
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// ===== FORM VALIDATION =====
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Initialize 2FA after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTwoFactor);
