import courseService from '../services/courseService.js';
import instructorService from '../services/instructorService.js';
import CourseModel from '../models/coursemodel.js';

class InstructorController {
  /**
   * Instructor Dashboard - Overview with statistics
   * @route GET /instructor/dashboard
   * @access Private (Instructor/Admin only)
   */
  async dashboard(req, res) {
    try {
      const instructorId = req.user.id;
      const dashboardData = await instructorService.getDashboardData(instructorId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Dashboard data retrieved successfully',
          data: dashboardData
        });
      }

      res.render('instructor/dashboard', {
        title: 'Instructor Dashboard | JooCourses',
        user: req.user,
        ...dashboardData
      });
    } catch (error) {
      console.error('Error loading instructor dashboard:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error loading dashboard');
      res.redirect('/');
    }
  }

  /**
   * Get all instructor's courses with filtering and pagination
   * @route GET /instructor/courses
   * @access Private (Instructor/Admin only)
   */
  async getCourses(req, res) {
    try {
      const instructorId = req.user.id;
      const filters = {
        status: req.query.status,
        search: req.query.search,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };
      
      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };

      const result = await instructorService.getInstructorCourses(instructorId, filters, pagination);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Courses retrieved successfully',
          data: result
        });
      }

      res.render('instructor/courses', {
        title: 'My Courses | JooCourses',
        user: req.user,
        courses: result.courses,
        pagination: result.pagination,
        filters
      });
    } catch (error) {
      console.error('Error retrieving instructor courses:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error loading courses');
      res.redirect('/instructor/dashboard');
    }
  }

  /**
   * Get specific course details for instructor
   * @route GET /instructor/courses/:id
   * @access Private (Instructor/Admin only)
   */
  async getCourseDetails(req, res) {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      
      const courseData = await instructorService.getCourseDetails(courseId, instructorId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Course details retrieved successfully',
          data: courseData
        });
      }

      res.render('instructor/course-details', {
        title: `${courseData.course.title} | JooCourses`,
        user: req.user,
        ...courseData
      });
    } catch (error) {
      console.error('Error retrieving course details:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', error.message);
      res.redirect('/instructor/courses');
    }
  }

  /**
   * Show create course form
   * @route GET /instructor/courses/new
   * @access Private (Instructor/Admin only)
   */
  async showCreateForm(req, res) {
    try {
      const formData = await instructorService.getCourseFormData();

      res.render('instructor/course-form', {
        title: 'Create New Course | JooCourses',
        user: req.user,
        course: null,
        isEdit: false,
        ...formData
      });
    } catch (error) {
      console.error('Error loading create course form:', error);
      req.flash('error', 'Error loading form');
      res.redirect('/instructor/courses');
    }
  }

  /**
   * Show edit course form
   * @route GET /instructor/courses/:id/edit
   * @access Private (Instructor/Admin only)
   */
  async showEditForm(req, res) {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      
      const courseData = await instructorService.getCourseForEdit(courseId, instructorId);
      const formData = await instructorService.getCourseFormData();

      res.render('instructor/course-form', {
        title: `Edit ${courseData.title} | JooCourses`,
        user: req.user,
        course: courseData,
        isEdit: true,
        ...formData
      });
    } catch (error) {
      console.error('Error loading edit course form:', error);
      req.flash('error', error.message);
      res.redirect('/instructor/courses');
    }
  }

  /**
   * Create new course
   * @route POST /instructor/courses
   * @access Private (Instructor/Admin only)
   */
  async createCourse(req, res) {
    try {
      const courseData = { ...req.body };
      const instructorId = req.user.id;

      // Handle image upload
      if (req.file) {
        courseData.imageUrl = req.file.path || `/uploads/${req.file.filename}`;
      }

      // Parse tags if it's a string (from form data)
      if (typeof courseData.tags === 'string') {
        try {
          courseData.tags = JSON.parse(courseData.tags);
        } catch (e) {
          courseData.tags = courseData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }

      const course = await instructorService.createCourse(courseData, instructorId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(201).json({
          success: true,
          message: 'Course created successfully',
          data: { course }
        });
      }

      req.flash('success', 'Course created successfully!');
      res.redirect(`/instructor/courses/${course._id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error creating course: ' + error.message);
      res.redirect('/instructor/courses/new');
    }
  }

  /**
   * Update course
   * @route PUT /instructor/courses/:id OR POST /instructor/courses/:id
   * @access Private (Instructor/Admin only)
   */
  async updateCourse(req, res) {
    try {
      const courseId = req.params.id;
      const updateData = { ...req.body };
      const instructorId = req.user.id;

      // Handle image upload
      if (req.file) {
        updateData.imageUrl = req.file.path || `/uploads/${req.file.filename}`;
      }

      // Parse tags if it's a string
      if (typeof updateData.tags === 'string') {
        try {
          updateData.tags = JSON.parse(updateData.tags);
        } catch (e) {
          updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }

      const course = await instructorService.updateCourse(courseId, updateData, instructorId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Course updated successfully',
          data: { course }
        });
      }

      req.flash('success', 'Course updated successfully!');
      res.redirect(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating course:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error updating course: ' + error.message);
      res.redirect('back');
    }
  }

  /**
   * Delete course
   * @route DELETE /instructor/courses/:id OR POST /instructor/courses/:id/delete
   * @access Private (Instructor/Admin only)
   */
  async deleteCourse(req, res) {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;

      await instructorService.deleteCourse(courseId, instructorId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Course deleted successfully'
        });
      }

      req.flash('success', 'Course deleted successfully!');
      res.redirect('/instructor/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error deleting course: ' + error.message);
      res.redirect('/instructor/courses');
    }
  }

  /**
   * Toggle course publish status
   * @route POST /instructor/courses/:id/toggle-publish
   * @access Private (Instructor/Admin only)
   */
  async togglePublishStatus(req, res) {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;

      const course = await instructorService.togglePublishStatus(courseId, instructorId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: `Course ${course.status === 'published' ? 'published' : 'unpublished'} successfully`,
          data: { course }
        });
      }

      req.flash('success', `Course ${course.status === 'published' ? 'published' : 'unpublished'} successfully!`);
      res.redirect('back');
    } catch (error) {
      console.error('Error toggling publish status:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error updating course status: ' + error.message);
      res.redirect('back');
    }
  }
}

export default new InstructorController();
