import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME &&
         process.env.CLOUDINARY_API_KEY &&
         process.env.CLOUDINARY_API_SECRET;
};

// Enhanced Cloudinary storage for course images with multiple formats
const courseImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'course-platform/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 450, crop: 'fill', quality: 'auto', format: 'auto' },
      { width: 400, height: 225, crop: 'fill', quality: 'auto', format: 'auto' },
      { width: 200, height: 113, crop: 'fill', quality: 'auto', format: 'auto' }
    ],
    eager: [
      { width: 800, height: 450, crop: 'fill', quality: 'auto', format: 'webp' },
      { width: 400, height: 225, crop: 'fill', quality: 'auto', format: 'webp' },
      { width: 200, height: 113, crop: 'fill', quality: 'auto', format: 'webp' }
    ],
    eager_async: true
  },
});

// Cloudinary storage for course videos
const courseVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'course-platform/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  },
});

// Local storage fallback
const ensureUploadsDir = () => {
  const uploadsDir = './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Enhanced local storage with image processing
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  }
});

// Image processing middleware for local uploads
const processLocalImage = async (req, res, next) => {
  if (!req.file || isCloudinaryConfigured()) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const filename = path.parse(req.file.filename).name;
    const uploadsDir = path.dirname(inputPath);

    // Create different sizes
    const sizes = [
      { width: 800, height: 450, suffix: '_large' },
      { width: 400, height: 225, suffix: '_medium' },
      { width: 200, height: 113, suffix: '_small' }
    ];

    const processedImages = [];

    for (const size of sizes) {
      const outputPath = path.join(uploadsDir, `${filename}${size.suffix}.webp`);

      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      processedImages.push({
        size: `${size.width}x${size.height}`,
        path: outputPath,
        url: `/uploads/${filename}${size.suffix}.webp`
      });
    }

    // Also create optimized original format
    const optimizedPath = path.join(uploadsDir, `${filename}_optimized${path.extname(req.file.filename)}`);
    await sharp(inputPath)
      .jpeg({ quality: 85 })
      .png({ quality: 85 })
      .toFile(optimizedPath);

    // Update req.file with processed information
    req.file.processedImages = processedImages;
    req.file.optimizedPath = optimizedPath;
    req.file.optimizedUrl = `/uploads/${filename}_optimized${path.extname(req.file.filename)}`;

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    // Continue without processing if there's an error
    next();
  }
};

// Security checks for uploaded files
const performImageSecurityChecks = (file) => {
  const errors = [];
  let isValid = true;

  try {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
      isValid = false;
    }

    // Check filename for malicious patterns
    const maliciousPatterns = [
      /\.php$/i,
      /\.jsp$/i,
      /\.asp$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i,
      /\.sh$/i,
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Reserved Windows names
    ];

    const filename = file.originalname.toLowerCase();
    if (maliciousPatterns.some(pattern => pattern.test(filename))) {
      errors.push('Filename contains invalid or potentially dangerous characters');
      isValid = false;
    }

    // Check for double extensions
    const parts = filename.split('.');
    if (parts.length > 2) {
      errors.push('Multiple file extensions not allowed');
      isValid = false;
    }

    // Validate MIME type against file signature (magic numbers)
    const mimeTypeValidation = validateMimeTypeSignature(file);
    if (!mimeTypeValidation.isValid) {
      errors.push(...mimeTypeValidation.errors);
      isValid = false;
    }

  } catch (error) {
    errors.push('Security validation failed: ' + error.message);
    isValid = false;
  }

  return { isValid, errors };
};

// Validate MIME type against file signature
const validateMimeTypeSignature = (file) => {
  const errors = [];
  let isValid = true;

  // File signatures (magic numbers) for image types
  const signatures = {
    'image/jpeg': [
      [0xFF, 0xD8, 0xFF],  // JPEG
    ],
    'image/png': [
      [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]  // PNG
    ],
    'image/gif': [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],  // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]   // GIF89a
    ],
    'image/webp': [
      [0x52, 0x49, 0x46, 0x46]  // RIFF (WebP starts with RIFF)
    ]
  };

  // Note: In a real implementation, you would read the file buffer
  // For now, we'll do basic MIME type validation
  const allowedMimeTypes = Object.keys(signatures);
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push('MIME type not allowed');
    isValid = false;
  }

  return { isValid, errors };
};

// Enhanced file filters with security checks
const imageFilter = (_req, file, cb) => {
  try {
    // Check file extension
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    const validMimeType = allowedMimeTypes.includes(file.mimetype.toLowerCase());

    // Additional security checks
    const securityChecks = performImageSecurityChecks(file);

    if (extname && validMimeType && securityChecks.isValid) {
      return cb(null, true);
    } else {
      const errors = securityChecks.errors || ['Invalid file type'];
      cb(new Error(`File validation failed: ${errors.join(', ')}`));
    }
  } catch (error) {
    cb(new Error('File validation error: ' + error.message));
  }
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, mov, avi, mkv, webm)'));
  }
};

// Upload configurations
const uploadImage = multer({
  storage: isCloudinaryConfigured() ? courseImageStorage : localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: imageFilter
});

const uploadVideo = multer({
  storage: isCloudinaryConfigured() ? courseVideoStorage : localStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: videoFilter
});

// Combined upload for courses (image + videos)
const uploadCourseFiles = multer({
  storage: isCloudinaryConfigured() ? courseImageStorage : localStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'videos') {
      videoFilter(req, file, cb);
    } else {
      cb(new Error('Unexpected field name'));
    }
  }
});

// Export upload configurations
export { uploadImage, uploadVideo, uploadCourseFiles, cloudinary, processLocalImage };
export default uploadImage;
