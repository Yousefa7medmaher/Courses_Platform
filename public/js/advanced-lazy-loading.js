// ===== ADVANCED LAZY LOADING SYSTEM =====

/**
 * Advanced Lazy Loading with Performance Optimizations
 * Features: Intersection Observer, preloading, priority loading, network-aware loading
 */

class AdvancedLazyLoader {
    constructor() {
        this.observers = new Map();
        this.loadingQueue = [];
        this.loadedImages = new Set();
        this.preloadedImages = new Set();
        this.criticalImages = new Set();
        
        this.config = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            maxConcurrentLoads: 3,
            preloadDistance: 200,
            criticalViewportHeight: window.innerHeight,
            networkAwareLoading: true
        };

        this.networkInfo = this.getNetworkInfo();
        this.init();
    }

    init() {
        this.setupIntersectionObservers();
        this.identifyCriticalImages();
        this.setupPreloading();
        this.setupNetworkMonitoring();
        this.processExistingImages();
    }

    /**
     * Setup intersection observers for different loading strategies
     */
    setupIntersectionObservers() {
        // Main lazy loading observer
        this.observers.set('lazy', new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.queueImageLoad(entry.target, 'normal');
                    this.observers.get('lazy').unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        }));

        // Preload observer (larger margin for preloading)
        this.observers.set('preload', new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.queueImageLoad(entry.target, 'preload');
                    this.observers.get('preload').unobserve(entry.target);
                }
            });
        }, {
            rootMargin: `${this.config.preloadDistance}px 0px`,
            threshold: 0
        }));

        // Critical images observer (immediate loading)
        this.observers.set('critical', new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.queueImageLoad(entry.target, 'critical');
                    this.observers.get('critical').unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0
        }));
    }

    /**
     * Identify critical images (above the fold)
     */
    identifyCriticalImages() {
        const images = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < this.config.criticalViewportHeight) {
                this.criticalImages.add(img);
                img.dataset.priority = 'critical';
            }
        });
    }

    /**
     * Setup preloading for critical resources
     */
    setupPreloading() {
        // Preload critical images immediately
        this.criticalImages.forEach(img => {
            this.observers.get('critical').observe(img);
        });

        // Setup hover preloading for interactive elements
        this.setupHoverPreloading();
    }

    /**
     * Setup hover preloading for course cards and links
     */
    setupHoverPreloading() {
        const interactiveElements = document.querySelectorAll('.course-card, a[href*="/courses/"]');
        
        interactiveElements.forEach(element => {
            let preloadTimeout;
            
            element.addEventListener('mouseenter', () => {
                preloadTimeout = setTimeout(() => {
                    this.preloadElementImages(element);
                }, 100); // Small delay to avoid unnecessary preloads
            });
            
            element.addEventListener('mouseleave', () => {
                if (preloadTimeout) {
                    clearTimeout(preloadTimeout);
                }
            });
        });
    }

    /**
     * Preload images within an element
     */
    preloadElementImages(element) {
        const images = element.querySelectorAll('img[data-src]:not([data-preloaded])');
        images.forEach(img => {
            if (!this.preloadedImages.has(img)) {
                this.preloadImage(img);
            }
        });
    }

    /**
     * Preload a single image
     */
    preloadImage(img) {
        const src = img.dataset.src || img.src;
        if (!src || this.preloadedImages.has(img)) return;

        this.preloadedImages.add(img);
        img.dataset.preloaded = 'true';

        const preloadImg = new Image();
        preloadImg.onload = () => {
            img.dataset.preloadComplete = 'true';
        };
        preloadImg.src = src;
    }

    /**
     * Setup network monitoring for adaptive loading
     */
    setupNetworkMonitoring() {
        if ('connection' in navigator && this.config.networkAwareLoading) {
            this.updateNetworkInfo();
            
            navigator.connection.addEventListener('change', () => {
                this.updateNetworkInfo();
                this.adjustLoadingStrategy();
            });
        }
    }

    /**
     * Get current network information
     */
    getNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                saveData: connection.saveData
            };
        }
        return { effectiveType: '4g', downlink: 10, saveData: false };
    }

    /**
     * Update network information
     */
    updateNetworkInfo() {
        this.networkInfo = this.getNetworkInfo();
    }

    /**
     * Adjust loading strategy based on network conditions
     */
    adjustLoadingStrategy() {
        const { effectiveType, saveData } = this.networkInfo;
        
        if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
            // Reduce concurrent loads and increase margins
            this.config.maxConcurrentLoads = 1;
            this.config.rootMargin = '20px 0px';
            this.config.preloadDistance = 50;
        } else if (effectiveType === '3g') {
            this.config.maxConcurrentLoads = 2;
            this.config.rootMargin = '30px 0px';
            this.config.preloadDistance = 100;
        } else {
            // Fast connection - use default settings
            this.config.maxConcurrentLoads = 3;
            this.config.rootMargin = '50px 0px';
            this.config.preloadDistance = 200;
        }
    }

    /**
     * Process existing images on the page
     */
    processExistingImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        
        lazyImages.forEach(img => {
            this.setupLazyImage(img);
        });
    }

    /**
     * Setup lazy loading for a single image
     */
    setupLazyImage(img) {
        if (img.dataset.lazySetup) return;
        
        img.dataset.lazySetup = 'true';
        
        // Determine priority
        const priority = img.dataset.priority || 
                        (this.criticalImages.has(img) ? 'critical' : 'normal');
        
        // Choose appropriate observer
        const observerKey = priority === 'critical' ? 'critical' : 'lazy';
        this.observers.get(observerKey).observe(img);
        
        // Also observe with preload observer if not critical
        if (priority !== 'critical') {
            this.observers.get('preload').observe(img);
        }
    }

    /**
     * Queue image for loading with priority
     */
    queueImageLoad(img, priority = 'normal') {
        if (this.loadedImages.has(img)) return;

        const loadItem = {
            img,
            priority,
            timestamp: Date.now()
        };

        // Insert based on priority
        if (priority === 'critical') {
            this.loadingQueue.unshift(loadItem);
        } else {
            this.loadingQueue.push(loadItem);
        }

        this.processLoadingQueue();
    }

    /**
     * Process the loading queue with concurrency control
     */
    async processLoadingQueue() {
        const activeLoads = this.loadingQueue.filter(item => item.loading).length;
        
        if (activeLoads >= this.config.maxConcurrentLoads) {
            return;
        }

        const nextItem = this.loadingQueue.find(item => !item.loading);
        if (!nextItem) return;

        nextItem.loading = true;
        
        try {
            await this.loadImage(nextItem.img);
            this.loadedImages.add(nextItem.img);
        } catch (error) {
            console.warn('Lazy loading failed:', error);
        } finally {
            // Remove from queue
            const index = this.loadingQueue.indexOf(nextItem);
            if (index > -1) {
                this.loadingQueue.splice(index, 1);
            }
            
            // Process next item
            if (this.loadingQueue.length > 0) {
                setTimeout(() => this.processLoadingQueue(), 10);
            }
        }
    }

    /**
     * Load a single image
     */
    async loadImage(img) {
        const src = img.dataset.src || img.src;
        if (!src) return;

        // Use preloaded image if available
        if (img.dataset.preloadComplete === 'true') {
            img.src = src;
            img.classList.add('lazy-loaded');
            return;
        }

        // Load with timeout based on network conditions
        const timeout = this.getLoadTimeout();
        
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Image load timeout'));
            }, timeout);

            const tempImg = new Image();
            
            tempImg.onload = () => {
                clearTimeout(timeoutId);
                img.src = src;
                img.classList.add('lazy-loaded');
                
                // Trigger any existing onload handlers
                if (img.onload) {
                    img.onload();
                }
                
                resolve();
            };
            
            tempImg.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('Image load failed'));
            };
            
            // Apply network-aware quality settings
            const optimizedSrc = this.getOptimizedSrc(src);
            tempImg.src = optimizedSrc;
        });
    }

    /**
     * Get load timeout based on network conditions
     */
    getLoadTimeout() {
        const { effectiveType } = this.networkInfo;
        
        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                return 15000; // 15 seconds
            case '3g':
                return 10000; // 10 seconds
            default:
                return 5000;  // 5 seconds
        }
    }

    /**
     * Get optimized image source based on network conditions
     */
    getOptimizedSrc(src) {
        if (!src.includes('cloudinary.com')) {
            return src;
        }

        const { effectiveType, saveData } = this.networkInfo;
        
        let quality = 'auto';
        if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
            quality = '60';
        } else if (effectiveType === '3g') {
            quality = '75';
        }

        // Insert quality parameter into Cloudinary URL
        if (quality !== 'auto') {
            const parts = src.split('/upload/');
            if (parts.length === 2) {
                return `${parts[0]}/upload/q_${quality}/${parts[1]}`;
            }
        }

        return src;
    }

    /**
     * Add new images to lazy loading system
     */
    addImages(images) {
        images.forEach(img => {
            this.setupLazyImage(img);
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.loadingQueue = [];
        this.loadedImages.clear();
        this.preloadedImages.clear();
        this.criticalImages.clear();
    }
}

// Initialize advanced lazy loader
window.AdvancedLazyLoader = new AdvancedLazyLoader();

// Auto-setup for dynamically added images
const observer = new MutationObserver((mutations) => {
    const newImages = [];
    
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'IMG' && (node.hasAttribute('loading') || node.dataset.src)) {
                    newImages.push(node);
                } else if (node.querySelectorAll) {
                    const images = node.querySelectorAll('img[loading="lazy"], img[data-src]');
                    newImages.push(...images);
                }
            }
        });
    });
    
    if (newImages.length > 0) {
        window.AdvancedLazyLoader.addImages(newImages);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
