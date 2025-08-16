import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Image Optimization Utility
 * Handles image processing, optimization, and format conversion
 */

class ImageOptimizer {
    constructor() {
        this.defaultSizes = {
            large: { width: 800, height: 450 },
            medium: { width: 400, height: 225 },
            small: { width: 200, height: 113 },
            thumbnail: { width: 150, height: 150 }
        };
        
        this.defaultQuality = {
            webp: 80,
            jpeg: 85,
            png: 85
        };
    }

    /**
     * Process and optimize image with multiple sizes and formats
     * @param {string} inputPath - Path to input image
     * @param {Object} options - Processing options
     * @returns {Object} - Processing results
     */
    async processImage(inputPath, options = {}) {
        const {
            outputDir = path.dirname(inputPath),
            basename = path.parse(inputPath).name,
            sizes = this.defaultSizes,
            formats = ['webp', 'jpeg'],
            quality = this.defaultQuality,
            preserveOriginal = true
        } = options;

        try {
            const results = {
                original: inputPath,
                processed: [],
                metadata: null
            };

            // Get image metadata
            const metadata = await sharp(inputPath).metadata();
            results.metadata = {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: metadata.size
            };

            // Process each size
            for (const [sizeName, dimensions] of Object.entries(sizes)) {
                for (const format of formats) {
                    const outputFilename = `${basename}_${sizeName}.${format}`;
                    const outputPath = path.join(outputDir, outputFilename);

                    await this.resizeAndOptimize(inputPath, outputPath, {
                        ...dimensions,
                        format,
                        quality: quality[format] || 80
                    });

                    results.processed.push({
                        size: sizeName,
                        format,
                        path: outputPath,
                        filename: outputFilename,
                        dimensions
                    });
                }
            }

            // Create optimized version of original size
            if (preserveOriginal) {
                const optimizedPath = path.join(outputDir, `${basename}_optimized.${metadata.format}`);
                await this.optimizeOriginal(inputPath, optimizedPath, metadata.format);
                
                results.optimized = {
                    path: optimizedPath,
                    filename: `${basename}_optimized.${metadata.format}`
                };
            }

            return results;
        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    /**
     * Resize and optimize image
     * @param {string} inputPath - Input image path
     * @param {string} outputPath - Output image path
     * @param {Object} options - Resize and optimization options
     */
    async resizeAndOptimize(inputPath, outputPath, options) {
        const { width, height, format, quality = 80 } = options;

        let pipeline = sharp(inputPath)
            .resize(width, height, {
                fit: 'cover',
                position: 'center',
                withoutEnlargement: true
            });

        // Apply format-specific optimizations
        switch (format) {
            case 'webp':
                pipeline = pipeline.webp({ quality, effort: 6 });
                break;
            case 'jpeg':
                pipeline = pipeline.jpeg({ 
                    quality, 
                    progressive: true,
                    mozjpeg: true 
                });
                break;
            case 'png':
                pipeline = pipeline.png({ 
                    quality, 
                    compressionLevel: 9,
                    progressive: true 
                });
                break;
            case 'avif':
                pipeline = pipeline.avif({ quality, effort: 6 });
                break;
        }

        await pipeline.toFile(outputPath);
    }

    /**
     * Optimize original image without resizing
     * @param {string} inputPath - Input image path
     * @param {string} outputPath - Output image path
     * @param {string} format - Image format
     */
    async optimizeOriginal(inputPath, outputPath, format) {
        let pipeline = sharp(inputPath);

        switch (format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                pipeline = pipeline.jpeg({ 
                    quality: this.defaultQuality.jpeg,
                    progressive: true,
                    mozjpeg: true 
                });
                break;
            case 'png':
                pipeline = pipeline.png({ 
                    quality: this.defaultQuality.png,
                    compressionLevel: 9,
                    progressive: true 
                });
                break;
            case 'webp':
                pipeline = pipeline.webp({ 
                    quality: this.defaultQuality.webp,
                    effort: 6 
                });
                break;
        }

        await pipeline.toFile(outputPath);
    }

    /**
     * Generate responsive image URLs for Cloudinary
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} options - URL generation options
     * @returns {Object} - Responsive URLs
     */
    generateCloudinaryUrls(publicId, options = {}) {
        const { 
            sizes = this.defaultSizes,
            formats = ['webp', 'auto'],
            quality = 'auto'
        } = options;

        const urls = {};

        for (const [sizeName, dimensions] of Object.entries(sizes)) {
            urls[sizeName] = {};
            
            for (const format of formats) {
                const transformation = [
                    `w_${dimensions.width}`,
                    `h_${dimensions.height}`,
                    'c_fill',
                    `q_${quality}`,
                    `f_${format}`
                ].join(',');

                urls[sizeName][format] = cloudinary.url(publicId, {
                    transformation
                });
            }
        }

        return urls;
    }

    /**
     * Clean up processed images
     * @param {Array} filePaths - Array of file paths to clean up
     */
    async cleanup(filePaths) {
        for (const filePath of filePaths) {
            try {
                await fs.unlink(filePath);
            } catch (error) {
                console.warn(`Failed to cleanup file ${filePath}:`, error.message);
            }
        }
    }

    /**
     * Get optimal image format based on browser support
     * @param {string} userAgent - Browser user agent
     * @returns {string} - Optimal format
     */
    getOptimalFormat(userAgent = '') {
        // Check for WebP support (most modern browsers)
        if (userAgent.includes('Chrome') || 
            userAgent.includes('Firefox') || 
            userAgent.includes('Edge') ||
            userAgent.includes('Opera')) {
            return 'webp';
        }
        
        // Check for AVIF support (newer browsers)
        if (userAgent.includes('Chrome/') && 
            parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0') >= 85) {
            return 'avif';
        }
        
        return 'jpeg';
    }

    /**
     * Validate image file
     * @param {string} filePath - Path to image file
     * @returns {Object} - Validation result
     */
    async validateImage(filePath) {
        try {
            const metadata = await sharp(filePath).metadata();
            
            const validation = {
                isValid: true,
                metadata,
                errors: []
            };

            // Check file size (max 10MB)
            if (metadata.size > 10 * 1024 * 1024) {
                validation.errors.push('File size exceeds 10MB limit');
                validation.isValid = false;
            }

            // Check dimensions (max 4000x4000)
            if (metadata.width > 4000 || metadata.height > 4000) {
                validation.errors.push('Image dimensions exceed 4000x4000 limit');
                validation.isValid = false;
            }

            // Check format
            const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
            if (!allowedFormats.includes(metadata.format.toLowerCase())) {
                validation.errors.push(`Unsupported format: ${metadata.format}`);
                validation.isValid = false;
            }

            return validation;
        } catch (error) {
            return {
                isValid: false,
                errors: [`Invalid image file: ${error.message}`],
                metadata: null
            };
        }
    }
}

export default new ImageOptimizer();
