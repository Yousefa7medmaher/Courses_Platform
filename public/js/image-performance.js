// ===== IMAGE PERFORMANCE MONITORING =====

/**
 * Image Performance Monitor
 * Tracks image loading performance, provides analytics, and optimizes delivery
 */

class ImagePerformanceMonitor {
    constructor() {
        this.metrics = {
            totalImages: 0,
            loadedImages: 0,
            failedImages: 0,
            totalLoadTime: 0,
            averageLoadTime: 0,
            cacheHits: 0,
            networkRequests: 0,
            bytesTransferred: 0
        };
        
        this.imageLoadTimes = new Map();
        this.performanceEntries = [];
        this.observers = [];
        
        this.init();
    }

    init() {
        this.setupPerformanceObserver();
        this.monitorExistingImages();
        this.setupNetworkMonitoring();
        this.startPeriodicReporting();
    }

    /**
     * Setup Performance Observer for image loading metrics
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Monitor resource loading
            const resourceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (this.isImageResource(entry.name)) {
                        this.recordImagePerformance(entry);
                    }
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.push(resourceObserver);

            // Monitor largest contentful paint for image optimization
            const lcpObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.element && entry.element.tagName === 'IMG') {
                        this.recordLCPImage(entry);
                    }
                });
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);
        }
    }

    /**
     * Check if resource is an image
     */
    isImageResource(url) {
        return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) ||
               url.includes('/uploads/') ||
               url.includes('/images/') ||
               url.includes('cloudinary.com');
    }

    /**
     * Record image performance metrics
     */
    recordImagePerformance(entry) {
        this.metrics.totalImages++;
        this.metrics.totalLoadTime += entry.duration;
        this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.totalImages;
        
        // Estimate bytes transferred
        if (entry.transferSize) {
            this.metrics.bytesTransferred += entry.transferSize;
        }
        
        // Check if served from cache
        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            this.metrics.cacheHits++;
        } else {
            this.metrics.networkRequests++;
        }
        
        // Store detailed entry
        this.performanceEntries.push({
            url: entry.name,
            duration: entry.duration,
            size: entry.transferSize || entry.decodedBodySize,
            fromCache: entry.transferSize === 0 && entry.decodedBodySize > 0,
            timestamp: entry.startTime
        });
        
        // Analyze performance
        this.analyzeImagePerformance(entry);
    }

    /**
     * Record LCP image metrics
     */
    recordLCPImage(entry) {
        console.log('LCP Image detected:', {
            element: entry.element,
            loadTime: entry.loadTime,
            renderTime: entry.renderTime,
            size: entry.size
        });
        
        // Mark as critical for future optimization
        if (entry.element) {
            entry.element.dataset.criticalImage = 'true';
        }
    }

    /**
     * Monitor existing images on the page
     */
    monitorExistingImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            this.setupImageMonitoring(img);
        });
    }

    /**
     * Setup monitoring for a single image
     */
    setupImageMonitoring(img) {
        if (img.dataset.monitored) return;
        
        img.dataset.monitored = 'true';
        const startTime = performance.now();
        
        // Monitor load success
        img.addEventListener('load', () => {
            const loadTime = performance.now() - startTime;
            this.imageLoadTimes.set(img, loadTime);
            this.metrics.loadedImages++;
            
            this.recordImageLoad(img, loadTime, true);
        });
        
        // Monitor load failure
        img.addEventListener('error', () => {
            const loadTime = performance.now() - startTime;
            this.metrics.failedImages++;
            
            this.recordImageLoad(img, loadTime, false);
        });
    }

    /**
     * Record individual image load event
     */
    recordImageLoad(img, loadTime, success) {
        const data = {
            src: img.src,
            alt: img.alt,
            loadTime,
            success,
            dimensions: {
                natural: { width: img.naturalWidth, height: img.naturalHeight },
                display: { width: img.offsetWidth, height: img.offsetHeight }
            },
            lazy: img.hasAttribute('loading') || img.dataset.src,
            critical: img.dataset.criticalImage === 'true',
            timestamp: Date.now()
        };
        
        // Check for optimization opportunities
        this.checkOptimizationOpportunities(data);
        
        // Send to analytics if configured
        this.sendImageAnalytics(data);
    }

    /**
     * Check for image optimization opportunities
     */
    checkOptimizationOpportunities(data) {
        const issues = [];
        
        // Check for oversized images
        if (data.dimensions.natural.width > data.dimensions.display.width * 2) {
            issues.push('oversized');
        }
        
        // Check for slow loading images
        if (data.loadTime > 2000) {
            issues.push('slow-loading');
        }
        
        // Check for failed critical images
        if (!data.success && data.critical) {
            issues.push('critical-failure');
        }
        
        if (issues.length > 0) {
            console.warn('Image optimization opportunity:', {
                src: data.src,
                issues,
                data
            });
            
            this.reportOptimizationOpportunity(data, issues);
        }
    }

    /**
     * Analyze overall image performance
     */
    analyzeImagePerformance(entry) {
        // Flag slow images
        if (entry.duration > 3000) {
            console.warn('Slow image detected:', entry.name, `${entry.duration}ms`);
        }
        
        // Flag large images
        if (entry.transferSize > 500000) { // 500KB
            console.warn('Large image detected:', entry.name, `${(entry.transferSize / 1024).toFixed(2)}KB`);
        }
    }

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        if ('connection' in navigator) {
            this.recordNetworkInfo();
            
            navigator.connection.addEventListener('change', () => {
                this.recordNetworkInfo();
            });
        }
    }

    /**
     * Record network information
     */
    recordNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            this.networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const successRate = this.metrics.totalImages > 0 ? 
            (this.metrics.loadedImages / this.metrics.totalImages) * 100 : 0;
        
        const cacheHitRate = this.metrics.totalImages > 0 ?
            (this.metrics.cacheHits / this.metrics.totalImages) * 100 : 0;
        
        return {
            ...this.metrics,
            successRate: successRate.toFixed(2),
            cacheHitRate: cacheHitRate.toFixed(2),
            networkInfo: this.networkInfo,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get performance recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.averageLoadTime > 2000) {
            recommendations.push('Consider optimizing image sizes and formats');
        }
        
        if (this.metrics.cacheHits / this.metrics.totalImages < 0.5) {
            recommendations.push('Improve image caching strategy');
        }
        
        if (this.metrics.failedImages > 0) {
            recommendations.push('Implement better fallback images');
        }
        
        return recommendations;
    }

    /**
     * Send analytics data
     */
    sendImageAnalytics(data) {
        // Only send in production and if analytics is configured
        if (window.gtag && typeof window.gtag === 'function') {
            window.gtag('event', 'image_load', {
                event_category: 'performance',
                event_label: data.success ? 'success' : 'failure',
                value: Math.round(data.loadTime),
                custom_map: {
                    dimension1: data.lazy ? 'lazy' : 'eager',
                    dimension2: data.critical ? 'critical' : 'normal'
                }
            });
        }
    }

    /**
     * Report optimization opportunity
     */
    reportOptimizationOpportunity(data, issues) {
        // Could send to monitoring service
        if (window.console && window.console.groupCollapsed) {
            console.groupCollapsed(`Image Optimization: ${data.src}`);
            console.log('Issues:', issues);
            console.log('Data:', data);
            console.groupEnd();
        }
    }

    /**
     * Start periodic performance reporting
     */
    startPeriodicReporting() {
        setInterval(() => {
            const summary = this.getPerformanceSummary();
            
            // Log summary in development
            if (window.location.hostname === 'localhost') {
                console.log('Image Performance Summary:', summary);
            }
            
            // Send to monitoring service in production
            this.sendPerformanceReport(summary);
        }, 30000); // Every 30 seconds
    }

    /**
     * Send performance report
     */
    sendPerformanceReport(summary) {
        // Implementation would depend on monitoring service
        // Example: send to custom analytics endpoint
        if (window.fetch && window.location.hostname !== 'localhost') {
            fetch('/api/analytics/image-performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(summary)
            }).catch(error => {
                console.warn('Failed to send performance report:', error);
            });
        }
    }

    /**
     * Add new images to monitoring
     */
    addImages(images) {
        images.forEach(img => {
            this.setupImageMonitoring(img);
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.imageLoadTimes.clear();
        this.performanceEntries = [];
    }
}

// Initialize performance monitor
window.ImagePerformanceMonitor = new ImagePerformanceMonitor();

// Auto-monitor new images
const observer = new MutationObserver((mutations) => {
    const newImages = [];
    
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'IMG') {
                    newImages.push(node);
                } else if (node.querySelectorAll) {
                    const images = node.querySelectorAll('img');
                    newImages.push(...images);
                }
            }
        });
    });
    
    if (newImages.length > 0) {
        window.ImagePerformanceMonitor.addImages(newImages);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
