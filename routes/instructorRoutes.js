import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import { uploadImage, uploadVideo } from '../middlewares/upload.js';
import {
  validateCourse,
  validateCourseUpdate,
  validateLesson,
  validateVideo,
  validateObjectId
} from '../middlewares/validation.js';
import instructorController from '../controllers/instructorController.js';
import instructorService from '../services/instructorService.js';
import courseController from '../controllers/courseController.js';

const router = express.Router();

// Apply authentication and authorization to all instructor routes
router.use(auth);
router.use(authorize('instructor', 'admin'));

/**
 * @route   GET /instructor/dashboard
 * @desc    Instructor dashboard with statistics
 * @access  Private (Instructor/Admin only)
 */
router.get('/dashboard', instructorController.dashboard);

/**
 * @route   GET /instructor/courses
 * @desc    Get all instructor's courses with filtering
 * @access  Private (Instructor/Admin only)
 */
router.get('/courses', instructorController.getCourses);

/**
 * @route   GET /instructor/courses/new
 * @desc    Show create course form
 * @access  Private (Instructor/Admin only)
 */
router.get('/courses/new', instructorController.showCreateForm);

/**
 * @route   POST /instructor/courses
 * @desc    Create new course
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses', 
  uploadImage.single('image'),
  validateCourse,
  instructorController.createCourse
);

/**
 * @route   GET /instructor/courses/:id
 * @desc    Get specific course details with analytics
 * @access  Private (Instructor/Admin only)
 */
router.get('/courses/:id', 
  validateObjectId('id'),
  instructorController.getCourseDetails
);

/**
 * @route   GET /instructor/courses/:id/edit
 * @desc    Show edit course form
 * @access  Private (Instructor/Admin only)
 */
router.get('/courses/:id/edit', 
  validateObjectId('id'),
  instructorController.showEditForm
);

/**
 * @route   PUT /instructor/courses/:id
 * @desc    Update course
 * @access  Private (Instructor/Admin only)
 */
router.put('/courses/:id', 
  validateObjectId('id'),
  uploadImage.single('image'),
  validateCourseUpdate,
  instructorController.updateCourse
);

/**
 * @route   POST /instructor/courses/:id
 * @desc    Update course (for form submissions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id', 
  validateObjectId('id'),
  uploadImage.single('image'),
  validateCourseUpdate,
  instructorController.updateCourse
);

/**
 * @route   DELETE /instructor/courses/:id
 * @desc    Delete course
 * @access  Private (Instructor/Admin only)
 */
router.delete('/courses/:id', 
  validateObjectId('id'),
  instructorController.deleteCourse
);

/**
 * @route   POST /instructor/courses/:id/delete
 * @desc    Delete course (for form submissions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/delete', 
  validateObjectId('id'),
  instructorController.deleteCourse
);

/**
 * @route   POST /instructor/courses/:id/toggle-publish
 * @desc    Toggle course publish status
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/toggle-publish', 
  validateObjectId('id'),
  instructorController.togglePublishStatus
);

// ==================== LESSON MANAGEMENT ====================

/**
 * @route   GET /instructor/courses/:id/lessons
 * @desc    Manage lessons page
 * @access  Private (Instructor/Admin only)
 */
router.get('/courses/:id/lessons', 
  validateObjectId('id'),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      
      const courseData = await instructorService.getCourseDetails(courseId, instructorId);

      res.render('instructor/lessons', {
        title: `Manage Lessons - ${courseData.course.title} | JooCourses`,
        user: req.user,
        course: courseData.course
      });
    } catch (error) {
      console.error('Error loading lessons page:', error);
      req.flash('error', error.message);
      res.redirect('/instructor/courses');
    }
  }
);

/**
 * @route   POST /instructor/courses/:id/lessons
 * @desc    Add lesson to course
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/lessons', 
  validateObjectId('id'),
  validateLesson,
  courseController.addLesson
);

/**
 * @route   PUT /instructor/courses/:id/lessons/:lessonId
 * @desc    Update lesson
 * @access  Private (Instructor/Admin only)
 */
router.put('/courses/:id/lessons/:lessonId', 
  validateObjectId('id'),
  validateLesson,
  courseController.updateLesson
);

/**
 * @route   POST /instructor/courses/:id/lessons/:lessonId
 * @desc    Update lesson (for form submissions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/lessons/:lessonId', 
  validateObjectId('id'),
  validateLesson,
  courseController.updateLesson
);

/**
 * @route   DELETE /instructor/courses/:id/lessons/:lessonId
 * @desc    Delete lesson
 * @access  Private (Instructor/Admin only)
 */
router.delete('/courses/:id/lessons/:lessonId', 
  validateObjectId('id'),
  courseController.deleteLesson
);

/**
 * @route   POST /instructor/courses/:id/lessons/:lessonId/delete
 * @desc    Delete lesson (for form submissions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/lessons/:lessonId/delete', 
  validateObjectId('id'),
  courseController.deleteLesson
);

// ==================== VIDEO MANAGEMENT ====================

/**
 * @route   GET /instructor/courses/:id/videos
 * @desc    Manage videos page
 * @access  Private (Instructor/Admin only)
 */
router.get('/courses/:id/videos', 
  validateObjectId('id'),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      
      const courseData = await instructorService.getCourseDetails(courseId, instructorId);

      res.render('instructor/videos', {
        title: `Manage Videos - ${courseData.course.title} | JooCourses`,
        user: req.user,
        course: courseData.course
      });
    } catch (error) {
      console.error('Error loading videos page:', error);
      req.flash('error', error.message);
      res.redirect('/instructor/courses');
    }
  }
);

/**
 * @route   POST /instructor/courses/:id/videos
 * @desc    Add video to course
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/videos', 
  validateObjectId('id'),
  uploadVideo.single('video'),
  validateVideo,
  courseController.addVideo
);

/**
 * @route   PUT /instructor/courses/:id/videos/:videoId
 * @desc    Update video
 * @access  Private (Instructor/Admin only)
 */
router.put('/courses/:id/videos/:videoId', 
  validateObjectId('id'),
  uploadVideo.single('video'),
  validateVideo,
  courseController.updateVideo
);

/**
 * @route   POST /instructor/courses/:id/videos/:videoId
 * @desc    Update video (for form submissions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/videos/:videoId', 
  validateObjectId('id'),
  uploadVideo.single('video'),
  validateVideo,
  courseController.updateVideo
);

/**
 * @route   DELETE /instructor/courses/:id/videos/:videoId
 * @desc    Delete video
 * @access  Private (Instructor/Admin only)
 */
router.delete('/courses/:id/videos/:videoId', 
  validateObjectId('id'),
  courseController.deleteVideo
);

/**
 * @route   POST /instructor/courses/:id/videos/:videoId/delete
 * @desc    Delete video (for form submissions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/courses/:id/videos/:videoId/delete', 
  validateObjectId('id'),
  courseController.deleteVideo
);

// ==================== API ROUTES ====================

/**
 * API routes for AJAX requests
 */

/**
 * @route   GET /api/instructor/dashboard
 * @desc    Get dashboard data (API)
 * @access  Private (Instructor/Admin only)
 */
router.get('/api/dashboard', instructorController.dashboard);

/**
 * @route   GET /api/instructor/courses
 * @desc    Get instructor courses (API)
 * @access  Private (Instructor/Admin only)
 */
router.get('/api/courses', instructorController.getCourses);

/**
 * @route   GET /api/instructor/courses/:id
 * @desc    Get course details (API)
 * @access  Private (Instructor/Admin only)
 */
router.get('/api/courses/:id', 
  validateObjectId('id'),
  instructorController.getCourseDetails
);

/**
 * @route   POST /api/instructor/courses
 * @desc    Create course (API)
 * @access  Private (Instructor/Admin only)
 */
router.post('/api/courses', 
  uploadImage.single('image'),
  validateCourse,
  instructorController.createCourse
);

/**
 * @route   PUT /api/instructor/courses/:id
 * @desc    Update course (API)
 * @access  Private (Instructor/Admin only)
 */
router.put('/api/courses/:id', 
  validateObjectId('id'),
  uploadImage.single('image'),
  validateCourseUpdate,
  instructorController.updateCourse
);

/**
 * @route   DELETE /api/instructor/courses/:id
 * @desc    Delete course (API)
 * @access  Private (Instructor/Admin only)
 */
router.delete('/api/courses/:id', 
  validateObjectId('id'),
  instructorController.deleteCourse
);

export default router;
