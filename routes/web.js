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

// Home page
router.get('/', optionalAuth, (req, res) => {
  res.render('index', {
    title: 'Home | Course Platform',
    user: req.user
  });
});

// Authentication pages
router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', {
    title: 'Login | Course Platform'
  });
});

router.get('/register', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', {
    title: 'Register | Course Platform'
  });
});

// Authentication actions
router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/logout', logout);

// Course browsing
router.get('/courses', optionalAuth, validateSearch, getAllCourses);
router.get('/courses/:id', optionalAuth, validateObjectId('id'), getCourseById);

// Student enrollment
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

// Dashboard redirects
router.get('/dashboard', auth, (req, res) => {
  if (req.user.role === 'instructor') {
    return res.redirect('/instructor/dashboard');
  } else if (req.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  } else {
    return res.redirect('/student/dashboard');
  }
});

// Student dashboard
router.get('/student/dashboard', auth, authorize('student'), (req, res) => {
  res.render('student/dashboard', {
    title: 'Student Dashboard | Course Platform',
    user: req.user
  });
});

// Instructor routes
router.get('/instructor/dashboard', 
  auth, 
  authorize('instructor', 'admin'), 
  getInstructorCourses
);

router.get('/instructor/courses/new', 
  auth, 
  authorize('instructor', 'admin'), 
  (req, res) => {
    res.render('instructor/course-form', {
      title: 'Create New Course | Course Platform',
      user: req.user,
      course: null,
      isEdit: false
    });
  }
);

router.post('/instructor/courses', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourse, 
  createCourse
);

router.get('/instructor/courses/:id/edit', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  async (req, res) => {
    try {
      const CourseModel = (await import('../models/coursemodel.js')).default;
      const course = await CourseModel.findById(req.params.id);
      
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/instructor/dashboard');
      }

      // Check ownership
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        req.flash('error', 'Access denied');
        return res.redirect('/instructor/dashboard');
      }

      res.render('instructor/course-form', {
        title: 'Edit Course | Course Platform',
        user: req.user,
        course,
        isEdit: true
      });
    } catch (error) {
      req.flash('error', 'Error loading course');
      res.redirect('/instructor/dashboard');
    }
  }
);

router.post('/instructor/courses/:id', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadImage.single('image'),
  validateCourseUpdate, 
  updateCourse
);

router.post('/instructor/courses/:id/delete', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'), 
  deleteCourse
);

// Lesson management pages
router.get('/instructor/courses/:id/lessons', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  async (req, res) => {
    try {
      const CourseModel = (await import('../models/coursemodel.js')).default;
      const course = await CourseModel.findById(req.params.id);
      
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/instructor/dashboard');
      }

      // Check ownership
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        req.flash('error', 'Access denied');
        return res.redirect('/instructor/dashboard');
      }

      res.render('instructor/lessons', {
        title: 'Manage Lessons | Course Platform',
        user: req.user,
        course
      });
    } catch (error) {
      req.flash('error', 'Error loading lessons');
      res.redirect('/instructor/dashboard');
    }
  }
);

router.post('/instructor/courses/:id/lessons', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  addLesson
);

router.post('/instructor/courses/:id/lessons/:lessonId', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  validateLesson, 
  updateLesson
);

router.post('/instructor/courses/:id/lessons/:lessonId/delete', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  deleteLesson
);

// Video management pages
router.get('/instructor/courses/:id/videos', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  async (req, res) => {
    try {
      const CourseModel = (await import('../models/coursemodel.js')).default;
      const course = await CourseModel.findById(req.params.id);
      
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/instructor/dashboard');
      }

      // Check ownership
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        req.flash('error', 'Access denied');
        return res.redirect('/instructor/dashboard');
      }

      res.render('instructor/videos', {
        title: 'Manage Videos | Course Platform',
        user: req.user,
        course
      });
    } catch (error) {
      req.flash('error', 'Error loading videos');
      res.redirect('/instructor/dashboard');
    }
  }
);

router.post('/instructor/courses/:id/videos', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  addVideo
);

router.post('/instructor/courses/:id/videos/:videoId', 
  auth, 
  authorize('instructor', 'admin'), 
  uploadVideo.single('video'),
  validateObjectId('id'),
  validateVideo, 
  updateVideo
);

router.post('/instructor/courses/:id/videos/:videoId/delete', 
  auth, 
  authorize('instructor', 'admin'), 
  validateObjectId('id'),
  deleteVideo
);

// Admin dashboard
router.get('/admin/dashboard', auth, authorize('admin'), (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard | Course Platform',
    user: req.user
  });
});

export default router;
