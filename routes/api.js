import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import { uploadImage, uploadVideo } from '../middlewares/upload.js';
import {
  validateRegister,
  validateLogin,
  validateCourse,
  validateCourseUpdate,
  validateLesson,
  validateVideo,
  validateRating,
  validateSearch,
  validateObjectId
} from '../middlewares/validation.js';

// Import controllers
import register from '../controllers/auth/register.js';
import login from '../controllers/auth/login.js';
import logout from '../controllers/auth/logout.js';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  rateCourse,
  getInstructorCourses,
  addLesson,
  updateLesson,
  deleteLesson,
  addVideo,
  updateVideo,
  deleteVideo
} from '../controllers/courseController.js';

const router = express.Router();

// Authentication routes
router.post('/auth/register', validateRegister, register);
router.post('/auth/login', validateLogin, login);
router.post('/auth/logout', logout);

// Public course routes
router.get('/courses', validateSearch, getAllCourses);
router.get('/courses/:id', validateObjectId('id'), getCourseById);

// Student routes
router.post('/courses/:id/enroll', 
  auth, 
  authorize('student'), 
  validateObjectId('id'), 
  enrollInCourse
);

router.post('/courses/:id/rate', 
  auth, 
  authorize('student'), 
  validateRating, 
  rateCourse
);

// Instructor routes
router.get('/instructor/courses', 
  auth, 
  authorize('instructor', 'admin'), 
  getInstructorCourses
);

router.post('/instructor/courses', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourse, 
  createCourse
);

router.put('/instructor/courses/:id', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourseUpdate, 
  updateCourse
);

router.delete('/instructor/courses/:id', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'), 
  deleteCourse
);

// Lesson management routes
router.post('/instructor/courses/:id/lessons', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  addLesson
);

router.put('/instructor/courses/:id/lessons/:lessonId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  updateLesson
);

router.delete('/instructor/courses/:id/lessons/:lessonId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  deleteLesson
);

// Video management routes
router.post('/instructor/courses/:id/videos', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  addVideo
);

router.put('/instructor/courses/:id/videos/:videoId', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  updateVideo
);

router.delete('/instructor/courses/:id/videos/:videoId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  deleteVideo
);

// Admin routes (if needed)
router.get('/admin/courses', 
  auth, 
  authorize('admin'), 
  getAllCourses
);

router.get('/admin/users', 
  auth, 
  authorize('admin'), 
  (req, res) => {
    // TODO: Implement user management for admin
    res.json({ message: 'Admin user management - to be implemented' });
  }
);

export default router;
