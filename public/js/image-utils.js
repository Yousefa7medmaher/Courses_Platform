// ===== ENHANCED IMAGE UTILITIES FOR JOOCOURSES =====

/**
 * Enhanced Image Component System
 * Provides comprehensive image handling with loading states, error handling,
 * lazy loading, and responsive design
 */

class ImageManager {
    constructor() {
        this.defaultImages = {
            course: '/images/defaults/course-placeholder.svg',
            user: '/images/defaults/user-placeholder.svg',
            video: '/images/defaults/video-placeholder.svg',
            category: {
                'Programming': '/images/defaults/programming-placeholder.svg',
                'Design': '/images/defaults/design-placeholder.svg',
                'Business': '/images/defaults/business-placeholder.svg',
                'Marketing': '/images/defaults/marketing-placeholder.svg',
                'Photography': '/images/defaults/photography-placeholder.svg',
                'Music': '/images/defaults/music-placeholder.svg',
                'default': '/images/defaults/course-placeholder.svg'
            }
        };
        
        this.loadingStates = new Map();
        this.errorStates = new Map();
        this.observers = new Map();
        
        this.initializeIntersectionObserver();
        this.preloadCriticalImages();
    }

    /**
     * Initialize Intersection Observer for lazy loading
     */
    initializeIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.lazyLoadObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    /**
     * Preload critical images that should load immediately
     */
    preloadCriticalImages() {
        const criticalImages = [
            this.defaultImages.course,
            this.defaultImages.user,
            this.defaultImages.video
        ];
        
        criticalImages.forEach(src => {
            if (src) {
                const img = new Image();
                img.src = src;
            }
        });
    }

    /**
     * Create an enhanced image element with all features
     * @param {Object} options - Image configuration options
     * @returns {HTMLElement} - Enhanced image container
     */
    createImage(options = {}) {
        const {
            src,
            alt = '',
            className = '',
            lazy = true,
            placeholder = 'course',
            category = null,
            sizes = null,
            aspectRatio = null,
            showLoading = true,
            errorCallback = null,
            loadCallback = null
        } = options;

        // Create container
        const container = document.createElement('div');
        container.className = `image-container ${className}`;
        
        if (aspectRatio) {
            container.style.aspectRatio = aspectRatio;
        }

        // Create loading skeleton
        if (showLoading) {
            const skeleton = this.createLoadingSkeleton();
            container.appendChild(skeleton);
        }

        // Create image element
        const img = document.createElement('img');
        img.alt = alt;
        img.className = 'enhanced-image';
        
        if (sizes) {
            img.sizes = sizes;
        }

        // Set up error handling
        img.onerror = () => this.handleImageError(img, container, placeholder, category, errorCallback);
        img.onload = () => this.handleImageLoad(img, container, loadCallback);

        // Set up lazy loading or immediate loading
        if (lazy && this.lazyLoadObserver) {
            img.dataset.src = src;
            img.className += ' lazy-image';
            this.lazyLoadObserver.observe(img);
        } else {
            img.src = src;
        }

        container.appendChild(img);
        return container;
    }

    /**
     * Create loading skeleton/spinner
     */
    createLoadingSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'image-skeleton';
        skeleton.innerHTML = `
            <div class="skeleton-content">
                <div class="skeleton-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="skeleton-shimmer"></div>
            </div>
        `;
        return skeleton;
    }

    /**
     * Handle image loading
     */
    handleImageLoad(img, container, callback) {
        // Remove loading skeleton
        const skeleton = container.querySelector('.image-skeleton');
        if (skeleton) {
            skeleton.remove();
        }

        // Add loaded class for animations
        img.classList.add('loaded');
        container.classList.add('image-loaded');

        // Remove error state if it exists
        container.classList.remove('image-error');
        this.errorStates.delete(img);

        if (callback) {
            callback(img, container);
        }
    }

    /**
     * Handle image loading errors
     */
    handleImageError(img, container, placeholder, category, callback) {
        console.warn('Image failed to load:', img.src || img.dataset.src);
        
        // Remove loading skeleton
        const skeleton = container.querySelector('.image-skeleton');
        if (skeleton) {
            skeleton.remove();
        }

        // Set error state
        container.classList.add('image-error');
        this.errorStates.set(img, true);

        // Set fallback image
        const fallbackSrc = this.getFallbackImage(placeholder, category);
        if (fallbackSrc && img.src !== fallbackSrc) {
            img.src = fallbackSrc;
            img.onerror = () => this.handleFinalError(img, container);
        } else {
            this.handleFinalError(img, container);
        }

        if (callback) {
            callback(img, container);
        }
    }

    /**
     * Handle final error when even fallback fails
     */
    handleFinalError(img, container) {
        // Create placeholder div
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder-final';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-image"></i>
                <span>Image unavailable</span>
            </div>
        `;
        
        // Replace image with placeholder
        img.style.display = 'none';
        container.appendChild(placeholder);
    }

    /**
     * Get appropriate fallback image
     */
    getFallbackImage(placeholder, category) {
        if (placeholder === 'course' && category && this.defaultImages.category[category]) {
            return this.defaultImages.category[category];
        }
        
        return this.defaultImages[placeholder] || this.defaultImages.course;
    }

    /**
     * Load image (for lazy loading)
     */
    loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    }

    /**
     * Retry loading a failed image
     */
    retryImage(img) {
        if (this.errorStates.has(img)) {
            this.errorStates.delete(img);
            const container = img.closest('.image-container');
            if (container) {
                container.classList.remove('image-error');

                // Add loading skeleton back
                const skeleton = this.createLoadingSkeleton();
                container.insertBefore(skeleton, img);

                // Retry loading
                const originalSrc = img.dataset.originalSrc || img.src;
                img.src = '';
                setTimeout(() => {
                    img.src = originalSrc;
                }, 100);
            }
        }
    }

    /**
     * Enhance existing images on the page
     */
    enhanceExistingImages() {
        const images = document.querySelectorAll('img:not(.enhanced-image)');
        images.forEach(img => {
            this.enhanceImage(img);
        });
    }

    /**
     * Enhance a single existing image
     */
    enhanceImage(img) {
        // Skip if already enhanced
        if (img.classList.contains('enhanced-image')) {
            return;
        }

        const container = img.parentElement;
        const src = img.src || img.dataset.src;
        const alt = img.alt;
        const className = img.className;

        // Determine placeholder type based on context
        let placeholder = 'course';
        if (container.classList.contains('profile-avatar') || container.classList.contains('instructor-avatar')) {
            placeholder = 'user';
        } else if (container.classList.contains('video-thumbnail')) {
            placeholder = 'video';
        }

        // Create enhanced version
        const enhanced = this.createImage({
            src,
            alt,
            className,
            placeholder,
            lazy: img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy'
        });

        // Replace original image
        container.replaceChild(enhanced, img);
    }

    /**
     * Create responsive image with multiple sizes
     */
    createResponsiveImage(options = {}) {
        const {
            src,
            srcSet = null,
            sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
            alt = '',
            className = '',
            placeholder = 'course',
            category = null
        } = options;

        const container = this.createImage({
            src,
            alt,
            className: `${className} responsive-image`,
            placeholder,
            category,
            sizes
        });

        const img = container.querySelector('.enhanced-image');
        if (srcSet) {
            img.srcset = srcSet;
        }

        return container;
    }

    /**
     * Preload images for better performance
     */
    preloadImages(urls) {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    /**
     * Get optimized image URL based on device and connection
     */
    getOptimizedImageUrl(baseUrl, options = {}) {
        const {
            width = null,
            height = null,
            quality = 'auto',
            format = 'auto'
        } = options;

        // Check if it's a Cloudinary URL
        if (baseUrl && baseUrl.includes('cloudinary.com')) {
            let transformations = [];

            if (width) transformations.push(`w_${width}`);
            if (height) transformations.push(`h_${height}`);
            transformations.push(`q_${quality}`);
            transformations.push(`f_${format}`);

            // Insert transformations into Cloudinary URL
            const parts = baseUrl.split('/upload/');
            if (parts.length === 2) {
                return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
            }
        }

        return baseUrl;
    }

    /**
     * Handle network-aware loading
     */
    getConnectionAwareQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                return 'low';
            } else if (connection.effectiveType === '3g') {
                return 'medium';
            }
        }
        return 'auto';
    }

    /**
     * Clean up observers and event listeners
     */
    destroy() {
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.disconnect();
        }
        this.loadingStates.clear();
        this.errorStates.clear();
        this.observers.clear();
    }
}

// Global instance
window.ImageManager = new ImageManager();

// Helper functions for easy use
window.createEnhancedImage = (options) => window.ImageManager.createImage(options);
window.createResponsiveImage = (options) => window.ImageManager.createResponsiveImage(options);
window.enhanceExistingImages = () => window.ImageManager.enhanceExistingImages();

// Auto-enhance images when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ImageManager.enhanceExistingImages();
});

// Re-enhance images when new content is added
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const images = node.querySelectorAll ? node.querySelectorAll('img:not(.enhanced-image)') : [];
                images.forEach(img => window.ImageManager.enhanceImage(img));
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
