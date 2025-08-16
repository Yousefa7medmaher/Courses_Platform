import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

/**
 * Image Security Middleware
 * Provides comprehensive security validation for image uploads and serving
 */

class ImageSecurityManager {
    constructor() {
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxDimensions = { width: 4000, height: 4000 };
        
        // File signatures for validation
        this.fileSignatures = {
            'image/jpeg': [
                [0xFF, 0xD8, 0xFF, 0xE0],
                [0xFF, 0xD8, 0xFF, 0xE1],
                [0xFF, 0xD8, 0xFF, 0xE2],
                [0xFF, 0xD8, 0xFF, 0xE3],
                [0xFF, 0xD8, 0xFF, 0xE8]
            ],
            'image/png': [
                [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
            ],
            'image/gif': [
                [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
                [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
            ],
            'image/webp': [
                [0x52, 0x49, 0x46, 0x46]
            ]
        };
    }

    /**
     * Validate uploaded image file
     */
    async validateImageFile(file) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            metadata: null
        };

        try {
            // Basic file validation
            const basicValidation = this.validateBasicFile(file);
            if (!basicValidation.isValid) {
                validation.isValid = false;
                validation.errors.push(...basicValidation.errors);
            }

            // File signature validation
            if (file.buffer) {
                const signatureValidation = this.validateFileSignature(file.buffer, file.mimetype);
                if (!signatureValidation.isValid) {
                    validation.isValid = false;
                    validation.errors.push(...signatureValidation.errors);
                }
            }

            // Image metadata validation using Sharp
            if (file.buffer || file.path) {
                const metadataValidation = await this.validateImageMetadata(file);
                validation.metadata = metadataValidation.metadata;
                
                if (!metadataValidation.isValid) {
                    validation.isValid = false;
                    validation.errors.push(...metadataValidation.errors);
                }
                
                validation.warnings.push(...metadataValidation.warnings);
            }

            // Security scan
            const securityValidation = this.performSecurityScan(file);
            if (!securityValidation.isValid) {
                validation.isValid = false;
                validation.errors.push(...securityValidation.errors);
            }

        } catch (error) {
            validation.isValid = false;
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    /**
     * Basic file validation
     */
    validateBasicFile(file) {
        const errors = [];
        let isValid = true;

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
            isValid = false;
        }

        // Check MIME type
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            errors.push(`MIME type ${file.mimetype} not allowed`);
            isValid = false;
        }

        // Check file extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!this.allowedExtensions.includes(ext)) {
            errors.push(`File extension ${ext} not allowed`);
            isValid = false;
        }

        // Check filename for malicious patterns
        const filenameValidation = this.validateFilename(file.originalname);
        if (!filenameValidation.isValid) {
            errors.push(...filenameValidation.errors);
            isValid = false;
        }

        return { isValid, errors };
    }

    /**
     * Validate filename for security issues
     */
    validateFilename(filename) {
        const errors = [];
        let isValid = true;

        // Check for dangerous patterns
        const dangerousPatterns = [
            /\.\./,  // Directory traversal
            /[<>:"|?*\x00-\x1f]/,  // Invalid characters
            /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Reserved names
            /\.(php|jsp|asp|exe|bat|cmd|scr|com|pif|vbs|js|jar|sh)$/i  // Executable extensions
        ];

        if (dangerousPatterns.some(pattern => pattern.test(filename))) {
            errors.push('Filename contains dangerous patterns');
            isValid = false;
        }

        // Check filename length
        if (filename.length > 255) {
            errors.push('Filename too long');
            isValid = false;
        }

        // Check for multiple extensions
        const parts = filename.split('.');
        if (parts.length > 2) {
            errors.push('Multiple file extensions not allowed');
            isValid = false;
        }

        return { isValid, errors };
    }

    /**
     * Validate file signature (magic numbers)
     */
    validateFileSignature(buffer, mimeType) {
        const errors = [];
        let isValid = true;

        const signatures = this.fileSignatures[mimeType];
        if (!signatures) {
            errors.push('Unknown MIME type for signature validation');
            return { isValid: false, errors };
        }

        const fileHeader = Array.from(buffer.slice(0, 8));
        const matchesSignature = signatures.some(signature => 
            signature.every((byte, index) => fileHeader[index] === byte)
        );

        if (!matchesSignature) {
            errors.push('File signature does not match MIME type');
            isValid = false;
        }

        return { isValid, errors };
    }

    /**
     * Validate image metadata using Sharp
     */
    async validateImageMetadata(file) {
        const errors = [];
        const warnings = [];
        let isValid = true;
        let metadata = null;

        try {
            const input = file.buffer || file.path;
            metadata = await sharp(input).metadata();

            // Check dimensions
            if (metadata.width > this.maxDimensions.width || metadata.height > this.maxDimensions.height) {
                errors.push(`Image dimensions ${metadata.width}x${metadata.height} exceed maximum ${this.maxDimensions.width}x${this.maxDimensions.height}`);
                isValid = false;
            }

            // Check for suspicious metadata
            if (metadata.exif && metadata.exif.length > 65536) {
                warnings.push('Large EXIF data detected');
            }

            // Check for animated images (potential security risk)
            if (metadata.pages && metadata.pages > 1) {
                warnings.push('Animated image detected');
            }

            // Check color space
            if (metadata.space && !['srgb', 'rgb', 'cmyk', 'lab'].includes(metadata.space)) {
                warnings.push(`Unusual color space: ${metadata.space}`);
            }

        } catch (error) {
            errors.push(`Image metadata validation failed: ${error.message}`);
            isValid = false;
        }

        return { isValid, errors, warnings, metadata };
    }

    /**
     * Perform security scan
     */
    performSecurityScan(file) {
        const errors = [];
        let isValid = true;

        // Check for suspicious file patterns
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
            errors.push('Suspicious file path detected');
            isValid = false;
        }

        // Check for null bytes
        if (file.originalname.includes('\x00')) {
            errors.push('Null byte in filename');
            isValid = false;
        }

        return { isValid, errors };
    }

    /**
     * Sanitize image by removing metadata and reprocessing
     */
    async sanitizeImage(inputPath, outputPath) {
        try {
            await sharp(inputPath)
                .rotate() // Auto-rotate based on EXIF
                .removeAlpha() // Remove alpha channel if not needed
                .jpeg({ quality: 85, progressive: true }) // Recompress
                .toFile(outputPath);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate secure filename
     */
    generateSecureFilename(originalName) {
        const ext = path.extname(originalName).toLowerCase();
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        return `${timestamp}_${random}${ext}`;
    }
}

// Middleware functions
const imageSecurityManager = new ImageSecurityManager();

/**
 * Middleware to validate uploaded images
 */
export const validateImageUpload = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const validation = await imageSecurityManager.validateImageFile(req.file);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Image validation failed',
                errors: validation.errors
            });
        }

        // Add validation results to request
        req.imageValidation = validation;
        
        // Log warnings if any
        if (validation.warnings.length > 0) {
            console.warn('Image validation warnings:', validation.warnings);
        }

        next();
    } catch (error) {
        console.error('Image validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Image validation failed',
            error: error.message
        });
    }
};

/**
 * Middleware to add security headers for image responses
 */
export const addImageSecurityHeaders = (req, res, next) => {
    // Only apply to image requests
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Prevent embedding in frames
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Content Security Policy for images
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'");
        
        // Cache control
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        
        // Remove server information
        res.removeHeader('X-Powered-By');
    }
    
    next();
};

/**
 * Middleware to validate image URLs
 */
export const validateImageUrl = (req, res, next) => {
    const { imageUrl } = req.body;
    
    if (imageUrl) {
        try {
            const url = new URL(imageUrl);
            
            // Only allow HTTPS for external URLs
            if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
                return res.status(400).json({
                    success: false,
                    message: 'Only HTTPS URLs are allowed for external images'
                });
            }
            
            // Check for allowed domains (if using external images)
            const allowedDomains = ['cloudinary.com', 'amazonaws.com', 'localhost'];
            if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
                return res.status(400).json({
                    success: false,
                    message: 'Image URL domain not allowed'
                });
            }
            
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image URL format'
            });
        }
    }
    
    next();
};

export { imageSecurityManager };
export default imageSecurityManager;
