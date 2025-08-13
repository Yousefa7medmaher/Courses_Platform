// ===== COURSE DETAILS PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeCourseDetails();
});

// ===== INITIALIZATION =====
function initializeCourseDetails() {
    initializeTabs();
    initializeEnrollButton();
    initializeWishlistButton();
    initializeReviewForm();
    initializeShareButtons();
    initializePreview();
}

// ===== TABS =====
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Update URL hash
            window.history.replaceState(null, null, `#${targetTab}`);
        });
    });

    // Load tab from URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        const tabButton = document.querySelector(`[data-tab="${hash}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

// ===== ENROLLMENT =====
function initializeEnrollButton() {
    const enrollBtn = document.querySelector('.enroll-btn');
    
    if (enrollBtn) {
        enrollBtn.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            enrollInCourse(courseId, this);
        });
    }
}

async function enrollInCourse(courseId, button) {
    try {
        setButtonLoading(button, true);
        
        const response = await JooCourses.apiCall(`/api/courses/${courseId}/enroll`, {
            method: 'POST'
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Successfully enrolled in course!');
            
            // Update button
            button.innerHTML = '<i class="fas fa-check"></i> Enrolled';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.disabled = true;
            
            // Update page content
            updateEnrollmentStatus(true);
            
            // Redirect to course after delay
            setTimeout(() => {
                window.location.href = `/student/courses/${courseId}`;
            }, 2000);
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        JooCourses.showFlashMessage('error', error.message || 'Enrollment failed. Please try again.');
    } finally {
        setButtonLoading(button, false);
    }
}

function updateEnrollmentStatus(isEnrolled) {
    // Update UI to reflect enrollment status
    const enrollBtn = document.querySelector('.enroll-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');
    
    if (isEnrolled && enrollBtn) {
        enrollBtn.outerHTML = `
            <a href="/student/courses/${enrollBtn.getAttribute('data-course-id')}" class="btn btn-success btn-block btn-lg">
                <i class="fas fa-play"></i>
                Continue Learning
            </a>
        `;
    }
}

// ===== WISHLIST =====
function initializeWishlistButton() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            toggleWishlist(courseId, this);
        });
    }
}

async function toggleWishlist(courseId, button) {
    try {
        const isActive = button.classList.contains('active');
        const method = isActive ? 'DELETE' : 'POST';
        
        const response = await JooCourses.apiCall(`/api/wishlist/${courseId}`, {
            method: method
        });

        if (response.success) {
            const icon = button.querySelector('i');
            
            if (isActive) {
                button.classList.remove('active');
                icon.className = 'far fa-heart';
                button.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
                JooCourses.showFlashMessage('info', 'Removed from wishlist');
            } else {
                button.classList.add('active');
                icon.className = 'fas fa-heart';
                button.innerHTML = '<i class="fas fa-heart"></i> In Wishlist';
                JooCourses.showFlashMessage('success', 'Added to wishlist');
            }
        }
    } catch (error) {
        console.error('Wishlist error:', error);
        JooCourses.showFlashMessage('error', 'Failed to update wishlist');
    }
}

// ===== REVIEW FORM =====
function initializeReviewForm() {
    const reviewForm = document.getElementById('review-form');
    const ratingInput = document.getElementById('rating-input');
    const ratingValue = document.getElementById('rating-value');
    const reviewText = document.getElementById('review-text');
    const charCount = document.getElementById('char-count');

    // Rating stars
    if (ratingInput && ratingValue) {
        const starBtns = ratingInput.querySelectorAll('.star-btn');
        
        starBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                ratingValue.value = rating;
                
                // Update star display
                starBtns.forEach((star, i) => {
                    if (i < rating) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
            });
            
            btn.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                
                starBtns.forEach((star, i) => {
                    if (i < rating) {
                        star.style.color = '#fbbf24';
                    } else {
                        star.style.color = '';
                    }
                });
            });
        });
        
        ratingInput.addEventListener('mouseleave', function() {
            const currentRating = parseInt(ratingValue.value) || 0;
            
            starBtns.forEach((star, i) => {
                if (i < currentRating) {
                    star.style.color = '#fbbf24';
                } else {
                    star.style.color = '';
                }
            });
        });
    }

    // Character count
    if (reviewText && charCount) {
        reviewText.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            if (count > 900) {
                charCount.style.color = 'var(--warning)';
            } else if (count > 950) {
                charCount.style.color = 'var(--error)';
            } else {
                charCount.style.color = '';
            }
        });
    }

    // Form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const courseId = window.location.pathname.split('/').pop();
    const submitBtn = form.querySelector('button[type="submit"]');

    const rating = formData.get('rating');
    if (!rating) {
        JooCourses.showFlashMessage('error', 'Please select a rating');
        return;
    }

    try {
        setButtonLoading(submitBtn, true);
        
        const response = await JooCourses.apiCall(`/api/courses/${courseId}/rate`, {
            method: 'POST',
            body: JSON.stringify({
                rating: parseInt(rating),
                review: formData.get('review')
            })
        });

        if (response.success) {
            JooCourses.showFlashMessage('success', 'Review submitted successfully!');
            
            // Reset form
            form.reset();
            document.getElementById('rating-value').value = '';
            document.querySelectorAll('.star-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('char-count').textContent = '0';
            
            // Reload page to show new review
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    } catch (error) {
        console.error('Review submission error:', error);
        JooCourses.showFlashMessage('error', error.message || 'Failed to submit review');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ===== SHARE FUNCTIONALITY =====
function initializeShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            shareCourse(platform);
        });
    });
}

function shareCourse(platform) {
    const url = window.location.href;
    const title = document.querySelector('.course-title').textContent;
    const description = document.querySelector('.course-subtitle').textContent;

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        copy: url
    };

    if (platform === 'copy') {
        copyToClipboard(url);
    } else {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        JooCourses.showFlashMessage('success', 'Course link copied to clipboard!');
    } catch (error) {
        console.error('Copy failed:', error);
        JooCourses.showFlashMessage('error', 'Failed to copy link');
    }
}

// ===== COURSE PREVIEW =====
function initializePreview() {
    // This would initialize video preview functionality
}

function playPreview() {
    // Open preview modal with course trailer/preview video
    JooCourses.openModal('preview-modal');
    
    // Load preview video (implementation depends on video service)
    const videoContainer = document.getElementById('preview-video-container');
    if (videoContainer) {
        videoContainer.innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-play"></i>
                <p>Preview video would load here</p>
            </div>
        `;
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
