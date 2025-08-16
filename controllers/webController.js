import courseService from '../services/courseService.js';
import authService from '../services/authService.js';
import CourseModel from '../models/coursemodel.js';

class WebController {
  /**
   * Home page
   * @route GET /
   * @access Public
   */
  async homePage(req, res) {
    try {
      // Get featured courses (latest 6 published courses)
      const featuredCourses = await CourseModel.find({ 
        status: 'published', 
        isPublished: true 
      })
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .limit(6);

      res.render('index', {
        title: 'Home | Course Platform',
        featuredCourses,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading home page:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading home page',
        error: { status: 500 }
      });
    }
  }

  /**
   * About page
   * @route GET /about
   * @access Public
   */
  async aboutPage(req, res) {
    res.render('about', {
      title: 'About Us | Course Platform',
      user: req.user
    });
  }

  /**
   * Contact page
   * @route GET /contact
   * @access Public
   */
  async contactPage(req, res) {
    res.render('contact', {
      title: 'Contact Us | Course Platform',
      user: req.user
    });
  }

  /**
   * Login page
   * @route GET /login
   * @access Public
   */
  async loginPage(req, res) {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    
    res.render('auth/login', {
      title: 'Login | Course Platform'
    });
  }

  /**
   * Registration page
   * @route GET /register
   * @access Public
   */
  async registerPage(req, res) {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    
    res.render('auth/register', {
      title: 'Register | Course Platform'
    });
  }

  /**
   * Dashboard redirect based on user role
   * @route GET /dashboard
   * @access Private
   */
  async dashboardRedirect(req, res) {
    if (req.user.role === 'instructor') {
      return res.redirect('/instructor/dashboard');
    } else if (req.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/student/dashboard');
    }
  }

  /**
   * Student dashboard
   * @route GET /student/dashboard
   * @access Private (Student only)
   */
  async studentDashboard(req, res) {
    try {
      // Get enrolled courses
      const enrolledCourses = await CourseModel.find({
        studentsEnrolled: req.user.id
      })
        .populate('instructor', 'name')
        .sort({ enrolledAt: -1 });

      res.render('student/dashboard', {
        title: 'Student Dashboard | Course Platform',
        enrolledCourses,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading student dashboard:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading dashboard',
        error: { status: 500 }
      });
    }
  }

  /**
   * Student enrolled courses
   * @route GET /student/courses
   * @access Private (Student only)
   */
  async studentCourses(req, res) {
    try {
      const enrolledCourses = await CourseModel.find({
        studentsEnrolled: req.user.id
      })
        .populate('instructor', 'name')
        .sort({ enrolledAt: -1 });

      res.render('student/courses', {
        title: 'My Courses | Course Platform',
        courses: enrolledCourses,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading student courses:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading courses',
        error: { status: 500 }
      });
    }
  }

  /**
   * Student course learning page
   * @route GET /student/courses/:id
   * @access Private (Student only)
   */
  async studentCoursePage(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id)
        .populate('instructor', 'name email');

      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/student/courses');
      }

      // Check if student is enrolled
      if (!course.studentsEnrolled.includes(req.user.id)) {
        req.flash('error', 'You are not enrolled in this course');
        return res.redirect(`/courses/${req.params.id}`);
      }

      res.render('student/course-learning', {
        title: `${course.title} | Course Platform`,
        course,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading course learning page:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading course',
        error: { status: 500 }
      });
    }
  }

  /**
   * Create course form
   * @route GET /instructor/courses/new
   * @access Private (Instructor/Admin only)
   */
  async createCourseForm(req, res) {
    res.render('instructor/course-form', {
      title: 'Create New Course | Course Platform',
      user: req.user,
      course: null,
      isEdit: false
    });
  }

  /**
   * Edit course form
   * @route GET /instructor/courses/:id/edit
   * @access Private (Instructor/Admin only)
   */
  async editCourseForm(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);
      
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/instructor/dashboard');
      }

      // Check ownership
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
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
      console.error('Error loading edit course form:', error);
      req.flash('error', 'Error loading course');
      res.redirect('/instructor/dashboard');
    }
  }

  /**
   * Manage lessons page
   * @route GET /instructor/courses/:id/lessons
   * @access Private (Instructor/Admin only)
   */
  async manageLessonsPage(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);
      
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/instructor/dashboard');
      }

      // Check ownership
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
        req.flash('error', 'Access denied');
        return res.redirect('/instructor/dashboard');
      }

      res.render('instructor/lessons', {
        title: 'Manage Lessons | Course Platform',
        user: req.user,
        course
      });
    } catch (error) {
      console.error('Error loading lessons page:', error);
      req.flash('error', 'Error loading lessons');
      res.redirect('/instructor/dashboard');
    }
  }

  /**
   * Manage videos page
   * @route GET /instructor/courses/:id/videos
   * @access Private (Instructor/Admin only)
   */
  async manageVideosPage(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);
      
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/instructor/dashboard');
      }

      // Check ownership
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
        req.flash('error', 'Access denied');
        return res.redirect('/instructor/dashboard');
      }

      res.render('instructor/videos', {
        title: 'Manage Videos | Course Platform',
        user: req.user,
        course
      });
    } catch (error) {
      console.error('Error loading videos page:', error);
      req.flash('error', 'Error loading videos');
      res.redirect('/instructor/dashboard');
    }
  }

  /**
   * Admin dashboard
   * @route GET /admin/dashboard
   * @access Private (Admin only)
   */
  async adminDashboard(req, res) {
    try {
      // Check if user is admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Access Denied</title></head>
          <body>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <a href="/login">Login</a>
          </body>
          </html>
        `);
      }

      // Simple stats for now
      const stats = {
        totalUsers: 6,
        activeUsers: 5,
        totalInstructors: 2,
        totalCourses: 6,
        pendingUsers: 0,
        pendingInstructors: 0,
        notifications: 3
      };

      // Send a simple HTML response for now
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admin Dashboard</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
          </style>
        </head>
        <body>
          <h1>Admin Dashboard</h1>
          <p>Welcome, ${req.user.name}!</p>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${stats.totalUsers}</div>
              <div>Total Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.totalInstructors}</div>
              <div>Instructors</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.totalCourses}</div>
              <div>Courses</div>
            </div>
          </div>

          <div>
            <h2>Quick Actions</h2>
            <a href="/admin/users">Manage Users</a> |
            <a href="/admin/instructors">Manage Instructors</a> |
            <a href="/admin/courses">Manage Courses</a>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading dashboard',
        error: { status: 500 }
      });
    }
  }

  /**
   * Admin users management page
   * @route GET /admin/users
   * @access Private (Admin only)
   */
  async adminUsersPage(req, res) {
    try {
      // Check if user is admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
      }

      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>User Management</title></head>
        <body>
          <h1>User Management</h1>
          <p>Welcome, ${req.user.name}!</p>
          <p>User management functionality will be implemented here.</p>
          <a href="/admin/dashboard">Back to Dashboard</a>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error loading admin users page:', error);
      res.status(500).send('Error loading users page');
    }
  }

  /**
   * Admin instructors management page
   * @route GET /admin/instructors
   * @access Private (Admin only)
   */
  async adminInstructorsPage(req, res) {
    try {
      // Check if user is admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
      }

      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Instructor Management</title></head>
        <body>
          <h1>Instructor Management</h1>
          <p>Welcome, ${req.user.name}!</p>
          <p>Instructor management functionality will be implemented here.</p>
          <a href="/admin/dashboard">Back to Dashboard</a>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error loading admin instructors page:', error);
      res.status(500).send('Error loading instructors page');
    }
  }

  /**
   * Admin courses management page
   * @route GET /admin/courses
   * @access Private (Admin only)
   */
  async adminCoursesPage(req, res) {
    try {
      // Check if user is admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
      }

      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Course Management</title></head>
        <body>
          <h1>Course Management</h1>
          <p>Welcome, ${req.user.name}!</p>
          <p>Course management functionality will be implemented here.</p>
          <a href="/admin/dashboard">Back to Dashboard</a>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error loading admin courses page:', error);
      res.status(500).send('Error loading courses page');
    }
  }
}

export default new WebController();
