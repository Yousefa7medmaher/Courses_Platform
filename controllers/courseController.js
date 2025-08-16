import courseService from '../services/courseService.js';

class CourseController {
  /**
   * Get all published courses with search and filters
   * @route GET /api/courses OR GET /courses
   * @access Public
   */
  async getAllCourses(req, res) {
    try {
      const filters = {
        search: req.query.search,
        category: req.query.category,
        level: req.query.level,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        minRating: req.query.minRating,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await courseService.getAllCourses(filters, pagination);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Courses retrieved successfully',
          data: result
        });
      }

      // For web routes, render the courses page
      res.render('courses/index', {
        title: 'All Courses',
        courses: result.courses,
        pagination: result.pagination,
        filters,
        user: req.user
      });
    } catch (error) {
      console.error('Error retrieving courses:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).render('error', {
        title: 'Error',
        message: 'Error retrieving courses',
        error: { status: 500 }
      });
    }
  }

  /**
   * Get course by ID with detailed information
   * @route GET /api/courses/:id OR GET /courses/:id
   * @access Public
   */
  async getCourseById(req, res) {
    try {
      const userId = req.user ? req.user.id : null;
      const result = await courseService.getCourseById(req.params.id, userId);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Course retrieved successfully',
          data: result
        });
      }

      // For web routes, render course details page
      res.render('courses/details', {
        title: result.course.title,
        course: result.course,
        isEnrolled: result.isEnrolled,
        canEdit: result.canEdit,
        user: req.user
      });
    } catch (error) {
      console.error('Error retrieving course:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(404).render('error', {
        title: 'Course Not Found',
        message: error.message,
        error: { status: 404 }
      });
    }
  }

  /**
   * Create new course (Instructor only)
   * @route POST /api/courses/instructor/create OR POST /instructor/courses
   * @access Private (Instructor/Admin)
   */
  async createCourse(req, res) {
    try {
      const courseData = { ...req.body };

      // Handle image upload
      if (req.file) {
        courseData.imageUrl = req.file.path || `/uploads/${req.file.filename}`;
      }

      // Parse tags if it's a string (from form data)
      if (typeof courseData.tags === 'string') {
        try {
          courseData.tags = JSON.parse(courseData.tags);
        } catch (e) {
          courseData.tags = courseData.tags.split(',').map(tag => tag.trim());
        }
      }

      const course = await courseService.createCourse(courseData, req.user.id, req.file);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(201).json({
          success: true,
          message: 'Course created successfully',
          data: { course }
        });
      }

      req.flash('success', 'Course created successfully!');
      res.redirect('/instructor/dashboard');
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
   * Update course (Instructor/Admin only)
   * @route PUT /api/courses/instructor/:id OR POST /instructor/courses/:id
   * @access Private (Instructor/Admin)
   */
  async updateCourse(req, res) {
    try {
      const updateData = { ...req.body };

      // Handle image upload
      if (req.file) {
        updateData.imageUrl = req.file.path || `/uploads/${req.file.filename}`;
      }

      // Parse tags if it's a string
      if (typeof updateData.tags === 'string') {
        try {
          updateData.tags = JSON.parse(updateData.tags);
        } catch (e) {
          updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
        }
      }

      const course = await courseService.updateCourse(req.params.id, updateData, req.user.id, req.file);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Course updated successfully',
          data: { course }
        });
      }

      req.flash('success', 'Course updated successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/edit`);
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
   * Delete course (Instructor/Admin only)
   * @route DELETE /api/courses/instructor/:id OR POST /instructor/courses/:id/delete
   * @access Private (Instructor/Admin)
   */
  async deleteCourse(req, res) {
    try {
      await courseService.deleteCourse(req.params.id, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Course deleted successfully'
        });
      }

      req.flash('success', 'Course deleted successfully!');
      res.redirect('/instructor/dashboard');
    } catch (error) {
      console.error('Error deleting course:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error deleting course: ' + error.message);
      res.redirect('/instructor/dashboard');
    }
  }

  /**
   * Get instructor's courses
   * @route GET /api/courses/instructor/my-courses OR GET /instructor/dashboard
   * @access Private (Instructor/Admin)
   */
  async getInstructorCourses(req, res) {
    try {
      const courses = await courseService.getInstructorCourses(req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Instructor courses retrieved successfully',
          data: { courses }
        });
      }

      // For web routes, render instructor dashboard
      res.render('instructor/dashboard', {
        title: 'Instructor Dashboard',
        courses,
        user: req.user
      });
    } catch (error) {
      console.error('Error retrieving instructor courses:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).render('error', {
        title: 'Error',
        message: 'Error retrieving courses',
        error: { status: 500 }
      });
    }
  }

  /**
   * Enroll student in course
   * @route POST /api/courses/:id/enroll OR POST /courses/:id/enroll
   * @access Private (Student only)
   */
  async enrollInCourse(req, res) {
    try {
      await courseService.enrollStudent(req.params.id, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Successfully enrolled in course'
        });
      }

      req.flash('success', 'Successfully enrolled in course!');
      res.redirect(`/courses/${req.params.id}`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', error.message);
      res.redirect('back');
    }
  }

  /**
   * Rate and review course
   * @route POST /api/courses/:id/rate OR POST /courses/:id/rate
   * @access Private (Student only)
   */
  async rateCourse(req, res) {
    try {
      const { rating, review } = req.body;
      await courseService.rateCourse(req.params.id, req.user.id, rating, review);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Rating submitted successfully'
        });
      }

      req.flash('success', 'Rating submitted successfully!');
      res.redirect(`/courses/${req.params.id}`);
    } catch (error) {
      console.error('Error rating course:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', error.message);
      res.redirect('back');
    }
  }

  /**
   * Add lesson to course
   * @route POST /api/courses/instructor/:id/lessons OR POST /instructor/courses/:id/lessons
   * @access Private (Instructor/Admin)
   */
  async addLesson(req, res) {
    try {
      await courseService.addLesson(req.params.id, req.body, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(201).json({
          success: true,
          message: 'Lesson added successfully'
        });
      }

      req.flash('success', 'Lesson added successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/lessons`);
    } catch (error) {
      console.error('Error adding lesson:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error adding lesson: ' + error.message);
      res.redirect('back');
    }
  }

  /**
   * Update lesson
   * @route PUT /api/courses/instructor/:id/lessons/:lessonId OR POST /instructor/courses/:id/lessons/:lessonId
   * @access Private (Instructor/Admin)
   */
  async updateLesson(req, res) {
    try {
      await courseService.updateLesson(req.params.id, req.params.lessonId, req.body, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Lesson updated successfully'
        });
      }

      req.flash('success', 'Lesson updated successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/lessons`);
    } catch (error) {
      console.error('Error updating lesson:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error updating lesson: ' + error.message);
      res.redirect('back');
    }
  }

  /**
   * Delete lesson
   * @route DELETE /api/courses/instructor/:id/lessons/:lessonId OR POST /instructor/courses/:id/lessons/:lessonId/delete
   * @access Private (Instructor/Admin)
   */
  async deleteLesson(req, res) {
    try {
      await courseService.deleteLesson(req.params.id, req.params.lessonId, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Lesson deleted successfully'
        });
      }

      req.flash('success', 'Lesson deleted successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/lessons`);
    } catch (error) {
      console.error('Error deleting lesson:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error deleting lesson: ' + error.message);
      res.redirect('back');
    }
  }

  /**
   * Add video to course
   * @route POST /api/courses/instructor/:id/videos OR POST /instructor/courses/:id/videos
   * @access Private (Instructor/Admin)
   */
  async addVideo(req, res) {
    try {
      const videoData = { ...req.body };

      // Handle video upload
      if (req.file) {
        videoData.videoUrl = req.file.path || `/uploads/${req.file.filename}`;
      }

      await courseService.addVideo(req.params.id, videoData, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(201).json({
          success: true,
          message: 'Video added successfully'
        });
      }

      req.flash('success', 'Video added successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/videos`);
    } catch (error) {
      console.error('Error adding video:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error adding video: ' + error.message);
      res.redirect('back');
    }
  }

  /**
   * Update video
   * @route PUT /api/courses/instructor/:id/videos/:videoId OR POST /instructor/courses/:id/videos/:videoId
   * @access Private (Instructor/Admin)
   */
  async updateVideo(req, res) {
    try {
      const updateData = { ...req.body };

      // Handle video upload
      if (req.file) {
        updateData.videoUrl = req.file.path || `/uploads/${req.file.filename}`;
      }

      await courseService.updateVideo(req.params.id, req.params.videoId, updateData, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Video updated successfully'
        });
      }

      req.flash('success', 'Video updated successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/videos`);
    } catch (error) {
      console.error('Error updating video:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error updating video: ' + error.message);
      res.redirect('back');
    }
  }

  /**
   * Delete video
   * @route DELETE /api/courses/instructor/:id/videos/:videoId OR POST /instructor/courses/:id/videos/:videoId/delete
   * @access Private (Instructor/Admin)
   */
  async deleteVideo(req, res) {
    try {
      await courseService.deleteVideo(req.params.id, req.params.videoId, req.user.id);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Video deleted successfully'
        });
      }

      req.flash('success', 'Video deleted successfully!');
      res.redirect(`/instructor/courses/${req.params.id}/videos`);
    } catch (error) {
      console.error('Error deleting video:', error);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', 'Error deleting video: ' + error.message);
      res.redirect('back');
    }
  }
}

export default new CourseController();
