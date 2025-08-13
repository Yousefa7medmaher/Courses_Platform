import CourseModel from '../models/coursemodel.js';
import User from '../models/usermodel.js';

class CourseService {
  /**
   * Get all published courses with filters and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Object} Courses with pagination info
   */
  async getAllCourses(filters = {}, pagination = {}) {
    const {
      search,
      category,
      level,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const { page = 1, limit = 12 } = pagination;

    // Build filter object
    const filter = { status: 'published', isPublished: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
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
   * Get course by ID with detailed information
   * @param {string} courseId - Course ID
   * @param {string} userId - Current user ID (optional)
   * @returns {Object} Course with enrollment and edit permissions
   */
  async getCourseById(courseId, userId = null) {
    const course = await CourseModel.findById(courseId)
      .populate('instructor', 'name email photo')
      .populate('studentsEnrolled', 'name email')
      .populate('ratings.user', 'name');

    if (!course) {
      throw new Error('Course not found');
    }

    let isEnrolled = false;
    let canEdit = false;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        // Check if user is enrolled
        isEnrolled = course.studentsEnrolled.some(
          student => student._id.toString() === userId
        );

        // Check if user can edit (instructor or admin)
        canEdit = user.role === 'admin' ||
          (user.role === 'instructor' && course.instructor._id.toString() === userId);
      }
    }

    return {
      course,
      isEnrolled,
      canEdit
    };
  }

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @param {string} instructorId - Instructor ID
   * @returns {Object} Created course
   */
  async createCourse(courseData, instructorId) {
    const instructor = await User.findById(instructorId);
    if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
      throw new Error('Only instructors can create courses');
    }

    const course = new CourseModel({
      ...courseData,
      instructor: instructorId
    });

    await course.save();
    await course.populate('instructor', 'name email');

    return course;
  }

  /**
   * Update course
   * @param {string} courseId - Course ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID
   * @returns {Object} Updated course
   */
  async updateCourse(courseId, updateData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied. You can only edit your own courses.');
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
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  async deleteCourse(courseId, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied. You can only delete your own courses.');
    }

    await CourseModel.findByIdAndDelete(courseId);
    return true;
  }

  /**
   * Get instructor's courses
   * @param {string} instructorId - Instructor ID
   * @returns {Array} Instructor's courses
   */
  async getInstructorCourses(instructorId) {
    const courses = await CourseModel.find({ instructor: instructorId })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return courses;
  }

  /**
   * Enroll student in course
   * @param {string} courseId - Course ID
   * @param {string} studentId - Student ID
   * @returns {Object} Updated course
   */
  async enrollStudent(courseId, studentId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'published') {
      throw new Error('Course is not available for enrollment');
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      throw new Error('Only students can enroll in courses');
    }

    // Check if already enrolled
    if (course.studentsEnrolled.includes(studentId)) {
      throw new Error('Student is already enrolled in this course');
    }

    await course.enrollStudent(studentId);
    return course;
  }

  /**
   * Rate and review course
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @param {number} rating - Rating (1-5)
   * @param {string} review - Review text (optional)
   * @returns {Object} Updated course
   */
  async rateCourse(courseId, userId, rating, review = '') {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user is enrolled
    if (!course.studentsEnrolled.includes(userId)) {
      throw new Error('You must be enrolled in this course to rate it');
    }

    // Check if user has already rated
    const existingRating = course.ratings.find(
      r => r.user.toString() === userId
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      // Add new rating
      course.ratings.push({
        user: userId,
        rating,
        review
      });
    }

    // Recalculate average rating
    await course.calculateAverageRating();

    return course;
  }
  /**
   * Add lesson to course
   */
  async addLesson(courseId, lessonData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.addLesson(lessonData);
    return course;
  }

  /**
   * Update lesson
   */
  async updateLesson(courseId, lessonId, updateData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.updateLesson(lessonId, updateData);
    return course;
  }

  /**
   * Delete lesson
   */
  async deleteLesson(courseId, lessonId, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.removeLesson(lessonId);
    return course;
  }

  /**
   * Add video to course
   */
  async addVideo(courseId, videoData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.addVideo(videoData);
    return course;
  }

  /**
   * Update video
   */
  async updateVideo(courseId, videoId, updateData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.updateVideo(videoId, updateData);
    return course;
  }

  /**
   * Delete video
   */
  async deleteVideo(courseId, videoId, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.removeVideo(videoId);
    return course;
  }

  /**
   * Add lesson to course
   */
  async addLesson(courseId, lessonData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.addLesson(lessonData);
    return course;
  }

  /**
   * Update lesson
   */
  async updateLesson(courseId, lessonId, updateData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.updateLesson(lessonId, updateData);
    return course;
  }

  /**
   * Delete lesson
   */
  async deleteLesson(courseId, lessonId, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.removeLesson(lessonId);
    return course;
  }

  /**
   * Add video to course
   */
  async addVideo(courseId, videoData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.addVideo(videoData);
    return course;
  }

  /**
   * Update video
   */
  async updateVideo(courseId, videoId, updateData, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.updateVideo(videoId, updateData);
    return course;
  }

  /**
   * Delete video
   */
  async deleteVideo(courseId, videoId, userId) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (user.role !== 'admin' && course.instructor.toString() !== userId) {
      throw new Error('Access denied');
    }

    await course.removeVideo(videoId);
    return course;
  }
}

export default new CourseService();
