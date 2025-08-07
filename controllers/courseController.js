import * as courseService from '../Services/courseService.js';

/**
 * Create a new course and handle file upload.
 * @route POST /api/courses
 * @access Private
 * @param {Object} req - Express request object containing course data and optional file.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the created course.
 */
export async function createCourse(req, res) {
  try {
    const courseData = req.body;

    // If image is uploaded via multer
    if (req.file) {
      courseData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse tags if it's a string (coming from form-data)
    if (typeof courseData.tags === 'string') {
      courseData.tags = JSON.parse(courseData.tags);
    }

    const course = await courseService.createCourse(courseData);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all courses with pagination.
 * @route GET /api/courses
 * @access Public
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @queryparam {number} [page=1] - Page number for pagination.
 * @queryparam {number} [limit=10] - Number of courses per page.
 * @returns {Object} Paginated result with total, limit, page, and courses array.
 */
export async function getAllCourses(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const result = await courseService.getAllCourses(page, limit);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  

/**
 * Get a specific course by ID.
 * @route GET /api/courses/:id
 * @access Public
 * @param {Object} req - Express request object containing course ID in params.
 * @param {Object} res - Express response object.
 * @returns {Object|null} Course object or 404 if not found.
 */
export async function getCourseById(req, res) {
  try {
    const courseId = req.params.id;
    const course = await courseService.getCourseById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update an existing course by ID.
 * @route PUT /api/courses/:id
 * @access Private
 * @param {Object} req - Express request object containing updated data and course ID.
 * @param {Object} res - Express response object.
 * @returns {Object|null} Updated course object or 404 if not found.
 */
export async function updateCourse(req, res) {
  try {
    const courseId = req.params.id;
    const updateData = req.body;

    // If image is uploaded via multer
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse tags if it's a string
    if (typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    const updatedCourse = await courseService.updateCourse(courseId, updateData);

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a course by ID.
 * @route DELETE /api/courses/:id
 * @access Private
 * @param {Object} req - Express request object containing course ID in params.
 * @param {Object} res - Express response object.
 * @returns {Object} Message if successfully deleted or 404 if not found.
 */
export async function deleteCourse(req, res) {
  try {
    const courseId = req.params.id;
    const deletedCourse = await courseService.deleteCourse(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
