// ===== PROGRESSIVE IMAGE LOADING =====

/**
 * Progressive Image Loading System
 * Provides smooth loading transitions, skeleton loaders, and error recovery
 */

class ProgressiveImageLoader {
    constructor() {
        this.loadingImages = new Set();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.enhanceExistingImages();
        this.setupErrorRecovery();
    }

    /**
     * Setup intersection observer for lazy loading
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    /**
     * Enhance existing images with progressive loading
     */
    enhanceExistingImages() {
        const images = document.querySelectorAll('img[loading="lazy"]:not(.progressive-enhanced)');
        images.forEach(img => this.enhanceImage(img));
    }

    /**
     * Enhance a single image with progressive loading
     */
    enhanceImage(img) {
        if (img.classList.contains('progressive-enhanced')) {
            return;
        }

        img.classList.add('progressive-enhanced');
        
        // Create container if not exists
        let container = img.closest('.image-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'image-container progressive-container';
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);
        }

        // Add loading skeleton
        this.addLoadingSkeleton(container);

        // Setup lazy loading
        if (this.observer && img.hasAttribute('loading')) {
            const src = img.src;
            img.dataset.src = src;
            img.src = '';
            img.classList.add('lazy-loading');
            this.observer.observe(img);
        } else {
            this.loadImage(img);
        }
    }

    /**
     * Add loading skeleton to container
     */
    addLoadingSkeleton(container) {
        if (container.querySelector('.loading-skeleton')) {
            return;
        }

        const skeleton = document.createElement('div');
        skeleton.className = 'loading-skeleton';
        skeleton.innerHTML = `
            <div class="skeleton-shimmer"></div>
            <div class="skeleton-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
        
        container.appendChild(skeleton);
    }

    /**
     * Load image with progressive enhancement
     */
    async loadImage(img) {
        const src = img.dataset.src || img.src;
        if (!src || this.loadingImages.has(img)) {
            return;
        }

        this.loadingImages.add(img);
        const container = img.closest('.image-container, .progressive-container');

        try {
            // Show loading state
            if (container) {
                container.classList.add('loading');
            }

            // Load image
            await this.loadImageWithTimeout(img, src);
            
            // Success - show image with transition
            this.showImageWithTransition(img, container);
            
        } catch (error) {
            console.warn('Image loading failed:', src, error);
            this.handleImageError(img, container, src);
        } finally {
            this.loadingImages.delete(img);
        }
    }

    /**
     * Load image with timeout
     */
    loadImageWithTimeout(img, src, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Image loading timeout'));
            }, timeout);

            const tempImg = new Image();
            
            tempImg.onload = () => {
                clearTimeout(timeoutId);
                img.src = src;
                resolve();
            };
            
            tempImg.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('Image loading failed'));
            };
            
            tempImg.src = src;
        });
    }

    /**
     * Show image with smooth transition
     */
    showImageWithTransition(img, container) {
        // Remove loading skeleton
        const skeleton = container?.querySelector('.loading-skeleton');
        if (skeleton) {
            skeleton.style.opacity = '0';
            setTimeout(() => skeleton.remove(), 300);
        }

        // Add loaded class for CSS transitions
        img.classList.add('loaded');
        if (container) {
            container.classList.remove('loading');
            container.classList.add('loaded');
        }

        // Trigger fade-in animation
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    }

    /**
     * Handle image loading errors
     */
    async handleImageError(img, container, originalSrc) {
        const retryCount = this.retryAttempts.get(img) || 0;
        
        // Try to retry loading
        if (retryCount < this.maxRetries) {
            this.retryAttempts.set(img, retryCount + 1);
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
            
            try {
                await this.loadImageWithTimeout(img, originalSrc);
                this.showImageWithTransition(img, container);
                this.retryAttempts.delete(img);
                return;
            } catch (retryError) {
                console.warn(`Image retry ${retryCount + 1} failed:`, originalSrc);
            }
        }

        // All retries failed - show fallback
        this.showFallbackImage(img, container);
    }

    /**
     * Show fallback image or placeholder
     */
    showFallbackImage(img, container) {
        // Remove loading skeleton
        const skeleton = container?.querySelector('.loading-skeleton');
        if (skeleton) {
            skeleton.remove();
        }

        // Try to get fallback from onerror attribute or data attribute
        const fallbackSrc = img.getAttribute('data-fallback') || 
                           img.getAttribute('onerror')?.match(/src='([^']+)'/)?.[1];

        if (fallbackSrc && img.src !== fallbackSrc) {
            img.src = fallbackSrc;
            img.classList.add('fallback-image');
        } else {
            // Create placeholder element
            this.createPlaceholder(img, container);
        }

        if (container) {
            container.classList.remove('loading');
            container.classList.add('error');
        }
    }

    /**
     * Create placeholder for failed images
     */
    createPlaceholder(img, container) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder-error';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-image"></i>
                <span>Image unavailable</span>
                <button class="retry-btn" onclick="window.ProgressiveLoader.retryImage(this)">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
        
        // Store original image data for retry
        placeholder.dataset.originalSrc = img.dataset.src || img.src;
        placeholder.dataset.originalAlt = img.alt;
        
        // Replace image with placeholder
        img.style.display = 'none';
        if (container) {
            container.appendChild(placeholder);
        } else {
            img.parentNode.insertBefore(placeholder, img.nextSibling);
        }
    }

    /**
     * Retry loading a failed image
     */
    async retryImage(button) {
        const placeholder = button.closest('.image-placeholder-error');
        const container = placeholder.closest('.image-container, .progressive-container');
        const img = container?.querySelector('img[style*="display: none"]');
        
        if (!img || !placeholder) return;

        const originalSrc = placeholder.dataset.originalSrc;
        
        // Reset retry count
        this.retryAttempts.delete(img);
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        try {
            await this.loadImageWithTimeout(img, originalSrc);
            
            // Success - remove placeholder and show image
            placeholder.remove();
            img.style.display = '';
            this.showImageWithTransition(img, container);
            
        } catch (error) {
            // Failed again
            button.innerHTML = '<i class="fas fa-redo"></i> Retry';
            button.disabled = false;
            console.warn('Image retry failed:', originalSrc);
        }
    }

    /**
     * Setup global error recovery
     */
    setupErrorRecovery() {
        // Handle images that fail to load after page load
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG' && !e.target.classList.contains('progressive-enhanced')) {
                this.enhanceImage(e.target);
            }
        }, true);
    }

    /**
     * Preload critical images
     */
    preloadCriticalImages(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.loadingImages.clear();
        this.retryAttempts.clear();
    }
}

// Initialize progressive loader
window.ProgressiveLoader = new ProgressiveImageLoader();

// Auto-enhance new images added to DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const images = node.tagName === 'IMG' ? [node] : 
                              node.querySelectorAll ? Array.from(node.querySelectorAll('img:not(.progressive-enhanced)')) : [];
                images.forEach(img => window.ProgressiveLoader.enhanceImage(img));
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
