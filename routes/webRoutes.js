import express from 'express';
import { auth, authorize, optionalAuth } from '../middlewares/auth.js';
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
import authController from '../controllers/authController.js';
import courseController from '../controllers/courseController.js';
import webController from '../controllers/webController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Course Platform'
  });
});

/**
 * @route   GET /
 * @desc    Home page
 * @access  Public
 */
router.get('/', optionalAuth, webController.homePage);

/**
 * @route   GET /about
 * @desc    About page
 * @access  Public
 */
router.get('/about', optionalAuth, webController.aboutPage);

/**
 * @route   GET /contact
 * @desc    Contact page
 * @access  Public
 */
router.get('/contact', optionalAuth, webController.contactPage);

// ==================== AUTHENTICATION PAGES ====================

/**
 * @route   GET /login
 * @desc    Login page
 * @access  Public
 */
router.get('/login', webController.loginPage);

/**
 * @route   GET /register
 * @desc    Registration page
 * @access  Public
 */
router.get('/register', webController.registerPage);

/**
 * @route   POST /login
 * @desc    Process login
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /register
 * @desc    Process registration
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authController.logout);

// ==================== COURSE BROWSING ====================

/**
 * @route   GET /courses
 * @desc    Course listing page
 * @access  Public
 */
router.get('/courses', optionalAuth, validateSearch, courseController.getAllCourses);

/**
 * @route   GET /courses/:id
 * @desc    Course details page
 * @access  Public
 */
router.get('/courses/:id', optionalAuth, validateObjectId('id'), courseController.getCourseById);

/**
 * @route   POST /courses/:id/enroll
 * @desc    Enroll in course
 * @access  Private (Student only)
 */
router.post('/courses/:id/enroll', 
  auth, 
  authorize('student'), 
  validateObjectId('id'), 
  courseController.enrollInCourse
);

/**
 * @route   POST /courses/:id/rate
 * @desc    Rate and review course
 * @access  Private (Student only)
 */
router.post('/courses/:id/rate', 
  auth, 
  authorize('student'), 
  validateRating, 
  courseController.rateCourse
);

// ==================== DASHBOARD REDIRECTS ====================

/**
 * @route   GET /dashboard
 * @desc    Role-based dashboard redirect
 * @access  Private
 */
router.get('/dashboard', auth, webController.dashboardRedirect);

// ==================== STUDENT ROUTES ====================

/**
 * @route   GET /student/dashboard
 * @desc    Student dashboard
 * @access  Private (Student only)
 */
router.get('/student/dashboard', auth, authorize('student'), webController.studentDashboard);

/**
 * @route   GET /student/courses
 * @desc    Student enrolled courses
 * @access  Private (Student only)
 */
router.get('/student/courses', auth, authorize('student'), webController.studentCourses);

/**
 * @route   GET /student/courses/:id
 * @desc    Student course learning page
 * @access  Private (Student only)
 */
router.get('/student/courses/:id', 
  auth, 
  authorize('student'), 
  validateObjectId('id'),
  webController.studentCoursePage
);

// ==================== INSTRUCTOR ROUTES ====================

/**
 * @route   GET /instructor/dashboard
 * @desc    Instructor dashboard
 * @access  Private (Instructor/Admin only)
 */
router.get('/instructor/dashboard', 
  auth, 
  authorize('instructor', 'admin'), 
  courseController.getInstructorCourses
);

/**
 * @route   GET /instructor/courses/new
 * @desc    Create course form
 * @access  Private (Instructor/Admin only)
 */
router.get('/instructor/courses/new', 
  auth, 
  authorize('instructor', 'admin'), 
  webController.createCourseForm
);

/**
 * @route   POST /instructor/courses
 * @desc    Create new course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/courses', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourse, 
  courseController.createCourse
);

/**
 * @route   GET /instructor/courses/:id/edit
 * @desc    Edit course form
 * @access  Private (Instructor/Admin only)
 */
router.get('/instructor/courses/:id/edit', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  webController.editCourseForm
);

/**
 * @route   POST /instructor/courses/:id
 * @desc    Update course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/courses/:id', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourseUpdate, 
  courseController.updateCourse
);

/**
 * @route   POST /instructor/courses/:id/delete
 * @desc    Delete course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/courses/:id/delete', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'), 
  courseController.deleteCourse
);

/**
 * @route   GET /instructor/courses/:id/lessons
 * @desc    Manage lessons page
 * @access  Private (Instructor/Admin only)
 */
router.get('/instructor/courses/:id/lessons', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  webController.manageLessonsPage
);

/**
 * @route   POST /instructor/courses/:id/lessons
 * @desc    Add lesson
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/courses/:id/lessons', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  courseController.addLesson
);

/**
 * @route   GET /instructor/courses/:id/videos
 * @desc    Manage videos page
 * @access  Private (Instructor/Admin only)
 */
router.get('/instructor/courses/:id/videos', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  webController.manageVideosPage
);

/**
 * @route   POST /instructor/courses/:id/videos
 * @desc    Add video
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/courses/:id/videos', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  courseController.addVideo
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /admin/dashboard
 * @desc    Admin dashboard
 * @access  Private (Admin only)
 */
router.get('/admin/dashboard', auth, authorize('admin'), webController.adminDashboard);

/**
 * @route   GET /admin/users
 * @desc    User management page
 * @access  Private (Admin only)
 */
router.get('/admin/users', auth, authorize('admin'), webController.adminUsersPage);

/**
 * @route   GET /admin/instructors
 * @desc    Instructor management page
 * @access  Private (Admin only)
 */
router.get('/admin/instructors', auth, authorize('admin'), webController.adminInstructorsPage);

/**
 * @route   GET /admin/courses
 * @desc    Course management page
 * @access  Private (Admin only)
 */
router.get('/admin/courses', auth, authorize('admin'), webController.adminCoursesPage);

export default router;
