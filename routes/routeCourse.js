import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

const router = express.Router();

// ===== Course APIs =====

// Create a new course
router.post('/api/courses', authenticate, createCourse);

// Get all courses
router.get('/api/courses', getAllCourses);

// Get a course by ID
router.get('/api/courses/:id', getCourseById);

// Update a course by ID
router.put('/api/courses/:id', authenticate, updateCourse);

// Delete a course by ID
router.delete('/api/courses/:id', authenticate, deleteCourse);

export default router;