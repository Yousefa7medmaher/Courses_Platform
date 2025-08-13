import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import { uploadImage, uploadVideo } from '../middlewares/upload.js';
import {
  validateCourse,
  validateCourseUpdate,
  validateLesson,
  validateVideo,
  validateRating,
  validateSearch,
  validateObjectId
} from '../middlewares/validation.js';
import courseController from '../controllers/courseController.js';

const router = express.Router();

/**
 * @route   GET /api/courses
 * @desc    Get all published courses with search and filters
 * @access  Public
 */
router.get('/', validateSearch, courseController.getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public
 */
router.get('/:id', validateObjectId('id'), courseController.getCourseById);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll student in course
 * @access  Private (Student only)
 */
router.post('/:id/enroll', 
  auth, 
  authorize('student'), 
  validateObjectId('id'), 
  courseController.enrollInCourse
);

/**
 * @route   POST /api/courses/:id/rate
 * @desc    Rate and review course
 * @access  Private (Student only)
 */
router.post('/:id/rate', 
  auth, 
  authorize('student'), 
  validateRating, 
  courseController.rateCourse
);

/**
 * @route   GET /api/courses/instructor/my-courses
 * @desc    Get instructor's courses
 * @access  Private (Instructor/Admin only)
 */
router.get('/instructor/my-courses', 
  auth, 
  authorize('instructor', 'admin'), 
  courseController.getInstructorCourses
);

/**
 * @route   POST /api/courses/instructor/create
 * @desc    Create new course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/create', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourse, 
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/instructor/:id
 * @desc    Update course
 * @access  Private (Instructor/Admin only)
 */
router.put('/instructor/:id', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourseUpdate, 
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/instructor/:id
 * @desc    Delete course
 * @access  Private (Instructor/Admin only)
 */
router.delete('/instructor/:id', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'), 
  courseController.deleteCourse
);

/**
 * @route   POST /api/courses/instructor/:id/lessons
 * @desc    Add lesson to course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/:id/lessons', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  courseController.addLesson
);

/**
 * @route   PUT /api/courses/instructor/:id/lessons/:lessonId
 * @desc    Update lesson
 * @access  Private (Instructor/Admin only)
 */
router.put('/instructor/:id/lessons/:lessonId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  courseController.updateLesson
);

/**
 * @route   DELETE /api/courses/instructor/:id/lessons/:lessonId
 * @desc    Delete lesson
 * @access  Private (Instructor/Admin only)
 */
router.delete('/instructor/:id/lessons/:lessonId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  courseController.deleteLesson
);

/**
 * @route   POST /api/courses/instructor/:id/videos
 * @desc    Add video to course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/:id/videos', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  courseController.addVideo
);

/**
 * @route   PUT /api/courses/instructor/:id/videos/:videoId
 * @desc    Update video
 * @access  Private (Instructor/Admin only)
 */
router.put('/instructor/:id/videos/:videoId', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  courseController.updateVideo
);

/**
 * @route   DELETE /api/courses/instructor/:id/videos/:videoId
 * @desc    Delete video
 * @access  Private (Instructor/Admin only)
 */
router.delete('/instructor/:id/videos/:videoId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  courseController.deleteVideo
);

export default router;
