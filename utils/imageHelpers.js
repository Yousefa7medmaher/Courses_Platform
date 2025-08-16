import { getDefaultImageUrl } from '../middlewares/imageDefaults.js';

/**
 * Image Helper Utilities
 * Provides helper functions for generating image URLs with fallbacks
 */

/**
 * Generate course image URL with fallback
 * @param {Object} course - Course object
 * @param {string} size - Image size (small, medium, large)
 * @returns {string} - Image URL
 */
export function getCourseImageUrl(course, size = 'medium') {
    if (!course) {
        return getDefaultImageUrl('course');
    }

    // Check for responsive images first
    if (course.responsiveImages && course.responsiveImages[size]) {
        // For Cloudinary URLs, prefer WebP if available
        if (course.responsiveImages[size].webp) {
            return course.responsiveImages[size].webp;
        }
        if (course.responsiveImages[size].auto) {
            return course.responsiveImages[size].auto;
        }
    }

    // Fallback to main image URL
    if (course.imageUrl) {
        return course.imageUrl;
    }

    // Final fallback to default image
    return getDefaultImageUrl('course', course.category);
}

/**
 * Generate user avatar URL with fallback
 * @param {Object} user - User object
 * @param {string} size - Image size
 * @returns {string} - Avatar URL
 */
export function getUserAvatarUrl(user, size = 'medium') {
    if (!user) {
        return getDefaultImageUrl('user');
    }

    if (user.photo) {
        return user.photo;
    }

    if (user.avatar) {
        return user.avatar;
    }

    return getDefaultImageUrl('user');
}

/**
 * Generate video thumbnail URL with fallback
 * @param {Object} video - Video object
 * @param {string} size - Image size
 * @returns {string} - Thumbnail URL
 */
export function getVideoThumbnailUrl(video, size = 'medium') {
    if (!video) {
        return getDefaultImageUrl('video');
    }

    if (video.thumbnail) {
        return video.thumbnail;
    }

    if (video.thumbnailUrl) {
        return video.thumbnailUrl;
    }

    return getDefaultImageUrl('video');
}

/**
 * Generate responsive image srcset
 * @param {Object} responsiveImages - Responsive images object
 * @param {string} fallbackUrl - Fallback URL
 * @returns {string} - Srcset string
 */
export function generateSrcSet(responsiveImages, fallbackUrl) {
    if (!responsiveImages) {
        return fallbackUrl;
    }

    const srcsetParts = [];

    // Add different sizes to srcset
    if (responsiveImages.small && responsiveImages.small.webp) {
        srcsetParts.push(`${responsiveImages.small.webp} 200w`);
    }
    if (responsiveImages.medium && responsiveImages.medium.webp) {
        srcsetParts.push(`${responsiveImages.medium.webp} 400w`);
    }
    if (responsiveImages.large && responsiveImages.large.webp) {
        srcsetParts.push(`${responsiveImages.large.webp} 800w`);
    }

    return srcsetParts.length > 0 ? srcsetParts.join(', ') : fallbackUrl;
}

/**
 * Generate picture element HTML for responsive images
 * @param {Object} options - Options for picture element
 * @returns {string} - Picture element HTML
 */
export function generatePictureElement(options = {}) {
    const {
        responsiveImages,
        fallbackUrl,
        alt = '',
        className = '',
        sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    } = options;

    if (!responsiveImages) {
        return `<img src="${fallbackUrl}" alt="${alt}" class="${className}">`;
    }

    let pictureHtml = '<picture>';

    // Add WebP sources
    const webpSrcset = generateSrcSet(responsiveImages, null);
    if (webpSrcset && webpSrcset !== fallbackUrl) {
        pictureHtml += `<source srcset="${webpSrcset}" sizes="${sizes}" type="image/webp">`;
    }

    // Add fallback img
    pictureHtml += `<img src="${fallbackUrl}" alt="${alt}" class="${className}" sizes="${sizes}">`;
    pictureHtml += '</picture>';

    return pictureHtml;
}

/**
 * Check if image URL is valid
 * @param {string} url - Image URL
 * @returns {boolean} - Whether URL is valid
 */
export function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    // Check for valid URL format
    try {
        new URL(url);
        return true;
    } catch {
        // Check for relative paths
        return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
    }
}

/**
 * Get optimized image URL based on device capabilities
 * @param {string} baseUrl - Base image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized URL
 */
export function getOptimizedImageUrl(baseUrl, options = {}) {
    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        userAgent = ''
    } = options;

    if (!baseUrl || !baseUrl.includes('cloudinary.com')) {
        return baseUrl;
    }

    // Determine optimal format based on browser support
    let optimalFormat = format;
    if (format === 'auto') {
        if (userAgent.includes('Chrome') || userAgent.includes('Firefox') || userAgent.includes('Edge')) {
            optimalFormat = 'webp';
        } else {
            optimalFormat = 'auto';
        }
    }

    // Build transformation string
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${optimalFormat}`);

    // Insert transformations into Cloudinary URL
    const parts = baseUrl.split('/upload/');
    if (parts.length === 2) {
        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }

    return baseUrl;
}

/**
 * Generate image data for templates
 * @param {Object} item - Item with image (course, user, video)
 * @param {string} type - Type of image (course, user, video)
 * @returns {Object} - Image data object
 */
export function getImageData(item, type = 'course') {
    let imageUrl, responsiveImages;

    switch (type) {
        case 'course':
            imageUrl = getCourseImageUrl(item);
            responsiveImages = item?.responsiveImages;
            break;
        case 'user':
            imageUrl = getUserAvatarUrl(item);
            responsiveImages = item?.responsiveImages;
            break;
        case 'video':
            imageUrl = getVideoThumbnailUrl(item);
            responsiveImages = item?.responsiveImages;
            break;
        default:
            imageUrl = getDefaultImageUrl(type);
            responsiveImages = null;
    }

    return {
        url: imageUrl,
        responsiveImages,
        srcset: generateSrcSet(responsiveImages, imageUrl),
        isDefault: !item || !item.imageUrl,
        type
    };
}

/**
 * Middleware to add image helpers to template locals
 */
export function addImageHelpersToLocals(req, res, next) {
    res.locals.getCourseImageUrl = getCourseImageUrl;
    res.locals.getUserAvatarUrl = getUserAvatarUrl;
    res.locals.getVideoThumbnailUrl = getVideoThumbnailUrl;
    res.locals.generateSrcSet = generateSrcSet;
    res.locals.generatePictureElement = generatePictureElement;
    res.locals.getImageData = getImageData;
    res.locals.getOptimizedImageUrl = getOptimizedImageUrl;
    next();
}
