// ===== UI UTILITIES AND COMPONENTS =====

// ===== LOADING STATES =====
function showLoading(message = 'Loading...') {
    let loader = document.getElementById('global-loader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-backdrop"></div>
            <div class="loader-content">
                <div class="loader-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="loader-text">${message}</div>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        loader.querySelector('.loader-text').textContent = message;
    }
    
    loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ===== FLASH MESSAGES =====
function showFlashMessage(type, message, duration = 5000) {
    const container = getOrCreateFlashContainer();
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.innerHTML = `
        <div class="flash-icon">
            <i class="fas fa-${getFlashIcon(type)}"></i>
        </div>
        <div class="flash-content">
            <div class="flash-text">${message}</div>
        </div>
        <button class="flash-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(flashMessage);
    
    // Animate in
    setTimeout(() => {
        flashMessage.classList.add('show');
    }, 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            removeFlashMessage(flashMessage);
        }, duration);
    }
    
    return flashMessage;
}

function getFlashIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getOrCreateFlashContainer() {
    let container = document.getElementById('flash-messages');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'flash-messages';
        container.className = 'flash-messages-container';
        document.body.appendChild(container);
    }
    
    return container;
}

function removeFlashMessage(flashMessage) {
    flashMessage.classList.add('hide');
    setTimeout(() => {
        if (flashMessage.parentElement) {
            flashMessage.parentElement.removeChild(flashMessage);
        }
    }, 300);
}

// ===== MODAL MANAGEMENT =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    const firstInput = modal.querySelector('input, textarea, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    // Add escape key handler
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalId);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Add backdrop click handler
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(modalId);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Clear any form data
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        
        // Clear validation errors
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
}

// ===== DROPDOWN MANAGEMENT =====
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('[data-dropdown]');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownId = this.getAttribute('data-dropdown');
            toggleDropdown(dropdownId);
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        closeAllDropdowns();
    });
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    const isOpen = dropdown.classList.contains('show');
    
    // Close all other dropdowns
    closeAllDropdowns();
    
    if (!isOpen) {
        dropdown.classList.add('show');
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// ===== TOOLTIP MANAGEMENT =====
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const tooltipText = element.getAttribute('data-tooltip');
    const position = element.getAttribute('data-tooltip-position') || 'top';
    
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = tooltipText;
    tooltip.id = 'active-tooltip';
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
        case 'top':
            top = rect.top - tooltipRect.height - 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
        case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
        case 'left':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.left - tooltipRect.width - 8;
            break;
        case 'right':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.right + 8;
            break;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}

function hideTooltip() {
    const tooltip = document.getElementById('active-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// ===== TABS MANAGEMENT =====
function initializeTabs() {
    const tabContainers = document.querySelectorAll('.tabs-container');
    
    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabPanes = container.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                this.classList.add('active');
                const targetPane = container.querySelector(`#${targetTab}`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    });
}

// ===== ACCORDION MANAGEMENT =====
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordion = this.closest('.accordion-item');
            const content = accordion.querySelector('.accordion-content');
            const isOpen = accordion.classList.contains('open');
            
            // Close all other accordions in the same group
            const group = this.closest('.accordion-group');
            if (group) {
                const otherAccordions = group.querySelectorAll('.accordion-item.open');
                otherAccordions.forEach(item => {
                    if (item !== accordion) {
                        item.classList.remove('open');
                        const otherContent = item.querySelector('.accordion-content');
                        if (otherContent) {
                            otherContent.style.maxHeight = '0';
                        }
                    }
                });
            }
            
            // Toggle current accordion
            if (isOpen) {
                accordion.classList.remove('open');
                content.style.maxHeight = '0';
            } else {
                accordion.classList.add('open');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        const searchContainer = input.closest('.search-container');
        const clearButton = searchContainer?.querySelector('.search-clear');
        
        // Show/hide clear button
        input.addEventListener('input', function() {
            if (clearButton) {
                clearButton.style.display = this.value ? 'block' : 'none';
            }
        });
        
        // Clear search
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                input.value = '';
                input.focus();
                input.dispatchEvent(new Event('input'));
            });
        }
    });
}

// ===== COPY TO CLIPBOARD =====
async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    try {
        await navigator.clipboard.writeText(text);
        showFlashMessage('success', successMessage);
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showFlashMessage('success', successMessage);
            return true;
        } catch (err) {
            showFlashMessage('error', 'Failed to copy to clipboard');
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// ===== SMOOTH SCROLLING =====
function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeToggle(savedTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.setAttribute('title', 'Switch to light mode');
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.setAttribute('title', 'Switch to dark mode');
    }
}

// ===== RESPONSIVE NAVIGATION =====
function initializeMobileNav() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            const isOpen = mobileNav.classList.contains('open');
            
            if (isOpen) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileNav);
    }
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav?.classList.contains('open')) {
            closeMobileNav();
        }
    });
}

function openMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    
    if (mobileNav) {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    if (mobileOverlay) {
        mobileOverlay.classList.add('show');
    }
    
    if (mobileToggle) {
        mobileToggle.classList.add('open');
    }
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    
    if (mobileNav) {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    if (mobileOverlay) {
        mobileOverlay.classList.remove('show');
    }
    
    if (mobileToggle) {
        mobileToggle.classList.remove('open');
    }
}

// ===== INFINITE SCROLL =====
function initializeInfiniteScroll(callback, threshold = 1000) {
    let loading = false;
    let hasMore = true;
    
    const scrollHandler = throttle(function() {
        if (loading || !hasMore) return;
        
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= documentHeight - threshold) {
            loading = true;
            callback().finally(() => {
                loading = false;
            });
        }
    }, 100);
    
    window.addEventListener('scroll', scrollHandler);
    
    return {
        setHasMore: (value) => { hasMore = value; },
        setLoading: (value) => { loading = value; }
    };
}

// ===== FORM UTILITIES =====
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.reset();
    
    // Clear validation errors
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

function disableForm(formId, disabled = true) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select, button');
    inputs.forEach(input => {
        input.disabled = disabled;
    });
}

// ===== ANIMATION UTILITIES =====
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(initialOpacity - (progress / duration), 0);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// ===== UTILITY FUNCTIONS =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== INITIALIZE ALL UI COMPONENTS =====
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdowns();
    initializeTooltips();
    initializeTabs();
    initializeAccordions();
    initializeMobileNav();
    initializeTheme();
    initializeLazyLoading();
    initializeSearch();
});

// ===== EXPORT TO GLOBAL SCOPE =====
if (typeof window !== 'undefined') {
    window.JooCourses = window.JooCourses || {};
    
    Object.assign(window.JooCourses, {
        showLoading,
        hideLoading,
        showFlashMessage,
        openModal,
        closeModal,
        copyToClipboard,
        smoothScrollTo,
        fadeIn,
        fadeOut,
        resetForm,
        disableForm,
        initializeInfiniteScroll,
        throttle,
        debounce
    });
}
