import CourseModel from '../models/coursemodel.js';
import User from '../models/usermodel.js';

class InstructorService {
  /**
   * Get dashboard data with statistics
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Dashboard data
   */
  async getDashboardData(instructorId) {
    // Verify instructor exists and has correct role
    const instructor = await User.findById(instructorId);
    if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
      throw new Error('Access denied. Only instructors can access this resource.');
    }

    // Get all instructor's courses
    const courses = await CourseModel.find({ instructor: instructorId })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      draftCourses: courses.filter(c => c.status === 'draft').length,
      pendingCourses: courses.filter(c => c.status === 'pending').length,
      totalStudents: courses.reduce((sum, course) => sum + course.totalStudents, 0),
      totalRevenue: courses.reduce((sum, course) => sum + (course.price * course.totalStudents), 0),
      averageRating: courses.length > 0 
        ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length 
        : 0,
      totalReviews: courses.reduce((sum, course) => sum + course.totalReviews, 0)
    };

    // Get recent courses (last 5)
    const recentCourses = courses.slice(0, 5);

    // Get top performing courses (by students enrolled)
    const topCourses = [...courses]
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, 5);

    // Get recent enrollments (students who enrolled in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments = await CourseModel.find({ 
      instructor: instructorId,
      'studentsEnrolled.0': { $exists: true }
    })
    .populate('studentsEnrolled', 'name email createdAt')
    .sort({ 'studentsEnrolled.createdAt': -1 })
    .limit(10);

    return {
      stats,
      recentCourses,
      topCourses,
      recentEnrollments: recentEnrollments.slice(0, 10),
      instructor
    };
  }

  /**
   * Get instructor's courses with filtering and pagination
   * @param {string} instructorId - Instructor ID
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Object} Courses with pagination
   */
  async getInstructorCourses(instructorId, filters = {}, pagination = {}) {
    // Verify instructor
    const instructor = await User.findById(instructorId);
    if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
      throw new Error('Access denied. Only instructors can access this resource.');
    }

    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 10 } = pagination;

    // Build filter object
    const filter = { instructor: instructorId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, totalCourses] = await Promise.all([
      CourseModel.find(filter)
        .populate('instructor', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CourseModel.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    return {
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCourses,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    };
  }

  /**
   * Get course details for instructor
   * @param {string} courseId - Course ID
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Course details with analytics
   */
  async getCourseDetails(courseId, instructorId) {
    const course = await CourseModel.findById(courseId)
      .populate('instructor', 'name email photo')
      .populate('studentsEnrolled', 'name email createdAt')
      .populate('ratings.user', 'name photo');

    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    if (instructorId !== 'admin' && course.instructor._id.toString() !== instructorId) {
      throw new Error('Access denied. You can only view your own courses.');
    }

    // Calculate additional analytics
    const analytics = {
      enrollmentTrend: await this.getEnrollmentTrend(courseId),
      ratingDistribution: this.getRatingDistribution(course.ratings),
      recentReviews: course.ratings
        .filter(r => r.review && r.review.trim())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };

    return {
      course,
      analytics,
      canEdit: true
    };
  }

  /**
   * Get course for editing (with ownership check)
   * @param {string} courseId - Course ID
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Course data
   */
  async getCourseForEdit(courseId, instructorId) {
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const user = await User.findById(instructorId);
    if (user.role !== 'admin' && course.instructor.toString() !== instructorId) {
      throw new Error('Access denied. You can only edit your own courses.');
    }

    return course;
  }

  /**
   * Get form data for course creation/editing
   * @returns {Object} Form data (categories, levels, etc.)
   */
  async getCourseFormData() {
    return {
      categories: [
        'Development',
        'Business',
        'Finance & Accounting',
        'IT & Software',
        'Office Productivity',
        'Personal Development',
        'Design',
        'Marketing',
        'Lifestyle',
        'Photography & Video',
        'Health & Fitness',
        'Music',
        'Teaching & Academics'
      ],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      statusOptions: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending Review' },
        { value: 'published', label: 'Published' }
      ]
    };
  }

  /**
   * Create new course
   * @param {Object} courseData - Course data
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Created course
   */
  async createCourse(courseData, instructorId) {
    // Verify instructor
    const instructor = await User.findById(instructorId);
    if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
      throw new Error('Only instructors can create courses');
    }

    // Set default values
    const course = new CourseModel({
      ...courseData,
      instructor: instructorId,
      status: courseData.status || 'draft',
      isPublished: courseData.status === 'published'
    });

    await course.save();
    await course.populate('instructor', 'name email');

    return course;
  }

  /**
   * Update course
   * @param {string} courseId - Course ID
   * @param {Object} updateData - Update data
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Updated course
   */
  async updateCourse(courseId, updateData, instructorId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const user = await User.findById(instructorId);
    if (user.role !== 'admin' && course.instructor.toString() !== instructorId) {
      throw new Error('Access denied. You can only edit your own courses.');
    }

    // Update published status based on status
    if (updateData.status) {
      updateData.isPublished = updateData.status === 'published';
      if (updateData.status === 'published' && !course.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    return updatedCourse;
  }

  /**
   * Delete course
   * @param {string} courseId - Course ID
   * @param {string} instructorId - Instructor ID
   * @returns {boolean} Success status
   */
  async deleteCourse(courseId, instructorId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const user = await User.findById(instructorId);
    if (user.role !== 'admin' && course.instructor.toString() !== instructorId) {
      throw new Error('Access denied. You can only delete your own courses.');
    }

    // Check if course has enrolled students
    if (course.studentsEnrolled.length > 0) {
      throw new Error('Cannot delete course with enrolled students. Please contact support.');
    }

    await CourseModel.findByIdAndDelete(courseId);
    return true;
  }

  /**
   * Toggle course publish status
   * @param {string} courseId - Course ID
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Updated course
   */
  async togglePublishStatus(courseId, instructorId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const user = await User.findById(instructorId);
    if (user.role !== 'admin' && course.instructor.toString() !== instructorId) {
      throw new Error('Access denied. You can only modify your own courses.');
    }

    // Toggle status
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    const updateData = {
      status: newStatus,
      isPublished: newStatus === 'published'
    };

    if (newStatus === 'published' && !course.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    ).populate('instructor', 'name email');

    return updatedCourse;
  }

  /**
   * Get enrollment trend for a course (last 30 days)
   * @param {string} courseId - Course ID
   * @returns {Array} Enrollment data by day
   */
  async getEnrollmentTrend(courseId) {
    // This is a simplified version - in a real app, you'd track enrollment dates
    const course = await CourseModel.findById(courseId);
    if (!course) return [];

    // Mock data for demonstration - replace with actual enrollment tracking
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        enrollments: Math.floor(Math.random() * 5) // Mock data
      });
    }
    return days;
  }

  /**
   * Get rating distribution
   * @param {Array} ratings - Course ratings
   * @returns {Object} Rating distribution
   */
  getRatingDistribution(ratings) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratings.forEach(rating => {
      if (rating.rating >= 1 && rating.rating <= 5) {
        distribution[rating.rating]++;
      }
    });

    return distribution;
  }
}

export default new InstructorService();
