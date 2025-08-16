import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image Defaults Middleware
 * Serves default placeholder images when requested images are not found
 */

class ImageDefaultsManager {
    constructor() {
        this.defaultsPath = path.join(__dirname, '../public/images/defaults');
        this.defaultImages = {
            course: 'course-placeholder.svg',
            user: 'user-placeholder.svg',
            video: 'video-placeholder.svg',
            programming: 'programming-placeholder.svg',
            design: 'design-placeholder.svg',
            business: 'business-placeholder.svg',
            marketing: 'marketing-placeholder.svg',
            photography: 'photography-placeholder.svg',
            music: 'music-placeholder.svg'
        };
        
        this.mimeTypes = {
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
    }

    /**
     * Middleware to serve default images for missing files
     */
    serveDefaultImage() {
        return (req, res, next) => {
            // Only handle image requests
            if (!this.isImageRequest(req.path)) {
                return next();
            }

            // Check if the requested file exists
            const requestedPath = path.join(__dirname, '../public', req.path);
            
            if (fs.existsSync(requestedPath)) {
                return next();
            }

            // Determine appropriate default image
            const defaultImage = this.getDefaultImageForRequest(req.path, req.query);
            
            if (defaultImage) {
                const defaultPath = path.join(this.defaultsPath, defaultImage);
                
                if (fs.existsSync(defaultPath)) {
                    const ext = path.extname(defaultImage);
                    const mimeType = this.mimeTypes[ext] || 'application/octet-stream';
                    
                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
                    
                    return res.sendFile(defaultPath);
                }
            }

            // If no default image found, continue to next middleware (404)
            next();
        };
    }

    /**
     * Check if the request is for an image
     */
    isImageRequest(requestPath) {
        const ext = path.extname(requestPath).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    }

    /**
     * Determine the appropriate default image based on request path and context
     */
    getDefaultImageForRequest(requestPath, query = {}) {
        // Check for category-specific defaults
        if (query.category) {
            const category = query.category.toLowerCase();
            if (this.defaultImages[category]) {
                return this.defaultImages[category];
            }
        }

        // Check path patterns
        if (requestPath.includes('/course') || requestPath.includes('/uploads')) {
            // Check for category in path
            for (const category of Object.keys(this.defaultImages)) {
                if (requestPath.toLowerCase().includes(category)) {
                    return this.defaultImages[category];
                }
            }
            return this.defaultImages.course;
        }

        if (requestPath.includes('/user') || requestPath.includes('/profile') || requestPath.includes('/avatar')) {
            return this.defaultImages.user;
        }

        if (requestPath.includes('/video') || requestPath.includes('/thumbnail')) {
            return this.defaultImages.video;
        }

        // Default fallback
        return this.defaultImages.course;
    }

    /**
     * Generate default image URL for a given context
     */
    getDefaultImageUrl(type = 'course', category = null) {
        if (category && this.defaultImages[category.toLowerCase()]) {
            return `/images/defaults/${this.defaultImages[category.toLowerCase()]}`;
        }
        
        if (this.defaultImages[type]) {
            return `/images/defaults/${this.defaultImages[type]}`;
        }
        
        return `/images/defaults/${this.defaultImages.course}`;
    }

    /**
     * Get all available default images
     */
    getAvailableDefaults() {
        return Object.keys(this.defaultImages).map(key => ({
            type: key,
            filename: this.defaultImages[key],
            url: `/images/defaults/${this.defaultImages[key]}`
        }));
    }

    /**
     * Check if default images exist and create missing ones
     */
    async validateDefaults() {
        const missing = [];
        
        for (const [type, filename] of Object.entries(this.defaultImages)) {
            const filePath = path.join(this.defaultsPath, filename);
            if (!fs.existsSync(filePath)) {
                missing.push({ type, filename, path: filePath });
            }
        }

        if (missing.length > 0) {
            console.warn('Missing default images:', missing.map(m => m.filename));
            // Could implement auto-generation of missing defaults here
        }

        return missing;
    }

    /**
     * Middleware to add default image URLs to response locals
     */
    addDefaultsToLocals() {
        return (req, res, next) => {
            res.locals.getDefaultImage = (type, category) => {
                return this.getDefaultImageUrl(type, category);
            };
            
            res.locals.defaultImages = this.getAvailableDefaults();
            next();
        };
    }
}

// Create singleton instance
const imageDefaultsManager = new ImageDefaultsManager();

// Export middleware functions
export const serveDefaultImage = imageDefaultsManager.serveDefaultImage();
export const addDefaultsToLocals = imageDefaultsManager.addDefaultsToLocals();
export const getDefaultImageUrl = (type, category) => imageDefaultsManager.getDefaultImageUrl(type, category);
export const validateDefaults = () => imageDefaultsManager.validateDefaults();

export default imageDefaultsManager;
