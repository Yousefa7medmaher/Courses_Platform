// ===== COURSES PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    initializeCoursesPage();
});

// ===== INITIALIZATION =====
function initializeCoursesPage() {
    initializeFilters();
    initializeViewToggle();
    initializeEnrollButtons();
    initializeWishlist();
    initializeSorting();
    initializePricePresets();
}

// ===== FILTERS =====
function initializeFilters() {
    const filterForm = document.getElementById('courses-filter-form');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const clearFiltersBtn = document.getElementById('clear-filters');

    if (filterForm) {
        // Auto-submit on filter change
        const filterInputs = filterForm.querySelectorAll('select, input[type="radio"]');
        filterInputs.forEach(input => {
            input.addEventListener('change', JooCourses.debounce(submitFilters, 500));
        });

        // Search input with debounce
        if (searchInput) {
            searchInput.addEventListener('input', JooCourses.debounce(submitFilters, 800));
            
            // Show/hide clear button
            searchInput.addEventListener('input', function() {
                if (searchClear) {
                    searchClear.style.opacity = this.value ? '1' : '0';
                }
            });
        }

        // Clear search
        if (searchClear) {
            searchClear.addEventListener('click', function() {
                searchInput.value = '';
                searchInput.focus();
                submitFilters();
            });
        }

        // Clear all filters
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
        }

        // Form submission
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitFilters();
        });
    }

    // Initialize filter tag removal
    initializeFilterTags();
}

function submitFilters() {
    const form = document.getElementById('courses-filter-form');
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();

    // Add non-empty values to params
    for (const [key, value] of formData.entries()) {
        if (value.trim()) {
            params.append(key, value);
        }
    }

    // Preserve current page if no new search
    const currentParams = new URLSearchParams(window.location.search);
    if (!formData.get('search') && currentParams.get('search') === params.get('search')) {
        params.set('page', currentParams.get('page') || '1');
    }

    // Update URL and reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.location.href = newUrl;
}

function clearAllFilters() {
    const form = document.getElementById('courses-filter-form');
    if (form) {
        form.reset();
        window.location.href = window.location.pathname;
    }
}

function initializeFilterTags() {
    const filterRemoveButtons = document.querySelectorAll('.filter-remove');
    
    filterRemoveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            removeFilter(filterType);
        });
    });
}

function removeFilter(filterType) {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete(filterType);
    currentParams.delete('page'); // Reset to first page
    
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    window.location.href = newUrl;
}

// ===== VIEW TOGGLE =====
function initializeViewToggle() {
    const viewToggles = document.querySelectorAll('.view-toggle');
    const coursesContainer = document.querySelector('.courses-container');

    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active state
            viewToggles.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update container class
            if (coursesContainer) {
                coursesContainer.className = `courses-container ${view}-view`;
            }
            
            // Update course cards
            const courseCards = document.querySelectorAll('.course-card');
            courseCards.forEach(card => {
                if (view === 'list') {
                    card.classList.add('list-view');
                } else {
                    card.classList.remove('list-view');
                }
            });

            // Save preference
            localStorage.setItem('coursesView', view);
        });
    });

    // Load saved view preference
    const savedView = localStorage.getItem('coursesView');
    if (savedView) {
        const viewToggle = document.querySelector(`[data-view="${savedView}"]`);
        if (viewToggle) {
            viewToggle.click();
        }
    }
}

// ===== ENROLLMENT =====
function initializeEnrollButtons() {
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    
    enrollButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            enrollInCourse(courseId, this);
        });
    });
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
            
            // Redirect to course after delay
            setTimeout(() => {
                window.location.href = `/student/courses/${courseId}`;
            }, 1500);
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        JooCourses.showFlashMessage('error', error.message || 'Enrollment failed. Please try again.');
    } finally {
        setButtonLoading(button, false);
    }
}

// ===== WISHLIST =====
function initializeWishlist() {
    const wishlistButtons = document.querySelectorAll('.course-wishlist');
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            toggleWishlist(courseId, this);
        });
    });
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
                JooCourses.showFlashMessage('info', 'Removed from wishlist');
            } else {
                button.classList.add('active');
                icon.className = 'fas fa-heart';
                JooCourses.showFlashMessage('success', 'Added to wishlist');
            }
        }
    } catch (error) {
        console.error('Wishlist error:', error);
        JooCourses.showFlashMessage('error', 'Failed to update wishlist');
    }
}

// ===== SORTING =====
function initializeSorting() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.set('sortBy', this.value);
            currentParams.delete('page'); // Reset to first page
            
            const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
            window.location.href = newUrl;
        });
    }
}

// ===== PRICE PRESETS =====
function initializePricePresets() {
    const pricePresets = document.querySelectorAll('.price-preset');
    const minPriceInput = document.querySelector('input[name="minPrice"]');
    const maxPriceInput = document.querySelector('input[name="maxPrice"]');

    pricePresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const min = this.getAttribute('data-min');
            const max = this.getAttribute('data-max');
            
            // Update active state
            pricePresets.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Update inputs
            if (minPriceInput) minPriceInput.value = min;
            if (maxPriceInput) maxPriceInput.value = max;
            
            // Submit filters
            submitFilters();
        });
    });

    // Update active preset based on current values
    updateActivePricePreset();
}

function updateActivePricePreset() {
    const minPriceInput = document.querySelector('input[name="minPrice"]');
    const maxPriceInput = document.querySelector('input[name="maxPrice"]');
    const pricePresets = document.querySelectorAll('.price-preset');

    if (!minPriceInput || !maxPriceInput) return;

    const minValue = minPriceInput.value;
    const maxValue = maxPriceInput.value;

    pricePresets.forEach(preset => {
        const presetMin = preset.getAttribute('data-min');
        const presetMax = preset.getAttribute('data-max');
        
        if (presetMin === minValue && presetMax === maxValue) {
            preset.classList.add('active');
        } else {
            preset.classList.remove('active');
        }
    });
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

// ===== INFINITE SCROLL (OPTIONAL) =====
function initializeInfiniteScroll() {
    let loading = false;
    let hasMore = true;
    
    window.addEventListener('scroll', JooCourses.debounce(function() {
        if (loading || !hasMore) return;
        
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= documentHeight - 1000) {
            loadMoreCourses();
        }
    }, 100));
}

async function loadMoreCourses() {
    // Implementation for infinite scroll
    // This would load more courses and append to the grid
}
