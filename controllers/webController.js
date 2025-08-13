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
      // Get statistics
      const [totalUsers, totalCourses, totalInstructors, totalStudents] = await Promise.all([
        authService.getAllUsers({}, { page: 1, limit: 1 }),
        CourseModel.countDocuments(),
        authService.getAllUsers({ role: 'instructor' }, { page: 1, limit: 1 }),
        authService.getAllUsers({ role: 'student' }, { page: 1, limit: 1 })
      ]);

      res.render('admin/dashboard', {
        title: 'Admin Dashboard | Course Platform',
        stats: {
          totalUsers: totalUsers.pagination.totalUsers,
          totalCourses,
          totalInstructors: totalInstructors.pagination.totalUsers,
          totalStudents: totalStudents.pagination.totalUsers
        },
        user: req.user
      });
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
      const filters = {
        role: req.query.role,
        search: req.query.search
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await authService.getAllUsers(filters, pagination);

      res.render('admin/users', {
        title: 'User Management | Course Platform',
        users: result.users,
        pagination: result.pagination,
        filters,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading admin users page:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading users',
        error: { status: 500 }
      });
    }
  }

  /**
   * Admin courses management page
   * @route GET /admin/courses
   * @access Private (Admin only)
   */
  async adminCoursesPage(req, res) {
    try {
      const filters = {
        search: req.query.search,
        category: req.query.category,
        status: req.query.status
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      // Get all courses (including unpublished for admin)
      const allCoursesFilter = { ...filters };
      delete allCoursesFilter.status; // Remove status filter for admin view
      
      const result = await courseService.getAllCourses(allCoursesFilter, pagination);

      res.render('admin/courses', {
        title: 'Course Management | Course Platform',
        courses: result.courses,
        pagination: result.pagination,
        filters,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading admin courses page:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading courses',
        error: { status: 500 }
      });
    }
  }
}

export default new WebController();
