import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import { validateObjectId } from '../middlewares/validation.js';
import userController from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin only)
 */
router.get('/', 
  auth, 
  authorize('admin'), 
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private (Admin only)
 */
router.get('/:id', 
  auth, 
  authorize('admin'), 
  validateObjectId('id'),
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin only)
 * @access  Private (Admin only)
 */
router.put('/:id', 
  auth, 
  authorize('admin'), 
  uploadImage.single('photo'),
  validateObjectId('id'),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  auth, 
  authorize('admin'), 
  validateObjectId('id'),
  userController.deleteUser
);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin only)
 */
router.put('/:id/role', 
  auth, 
  authorize('admin'), 
  validateObjectId('id'),
  userController.updateUserRole
);

/**
 * @route   GET /api/users/stats/overview
 * @desc    Get user statistics (Admin only)
 * @access  Private (Admin only)
 */
router.get('/stats/overview', 
  auth, 
  authorize('admin'), 
  userController.getUserStats
);

export default router;
