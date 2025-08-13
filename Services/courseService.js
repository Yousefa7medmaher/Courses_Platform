import CourseModel from '../models/coursemodel.js';

/**
 * Create a new course.
 * @param {Object} courseData - The data for the new course.
 * @returns {Promise<Object>} The created course document.
 */
export async function createCourse(courseData) {
  try {
    const course = await CourseModel.create(courseData);
    return course;
  } catch (error) {
    throw error;
  }
} 
/**
 * Get all courses with pagination.
 * @param {number} page - Page number.
 * @param {number} limit - Number of courses per page.
 * @returns {Promise<Object>} Paginated courses and metadata.
 */
export async function getAllCourses(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const courses = await CourseModel.find().skip(skip).limit(limit).lean();
    const total = await CourseModel.countDocuments();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      courses
    };
  } catch (error) {
    throw error;
  }
}


/**
 * Get a course by its ID.
 * @param {string} courseId - The ID of the course to retrieve.
 * @returns {Promise<Object|null>} The course document, or null if not found.
 */
export async function getCourseById(courseId) {
  try {
    const course = await CourseModel.findById(courseId).lean();
    return course;
  } catch (error) {
    throw error;
  }
}

/**
 * Update a course by its ID.
 * @param {string} courseId - The ID of the course to update.
 * @param {Object} updateData - The data to update the course with.
 * @returns {Promise<Object|null>} The updated course document, or null if not found.
 */
export async function updateCourse(courseId, updateData) {
  try {
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    );
    return updatedCourse;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a course by its ID.
 * @param {string} courseId - The ID of the course to delete.
 * @returns {Promise<Object|null>} The deleted course document, or null if not found.
 */
export async function deleteCourse(courseId) {
  try {
    const deletedCourse = await CourseModel.findByIdAndDelete(courseId);
    return deletedCourse;
  } catch (error) {
    throw error;
  }
}