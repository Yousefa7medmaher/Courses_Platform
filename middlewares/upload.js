import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
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

// Cloudinary storage for course images
const courseImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'course-platform/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 450, crop: 'fill', quality: 'auto' }
    ]
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

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
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
export { uploadImage, uploadVideo, uploadCourseFiles, cloudinary };
export default uploadImage;
