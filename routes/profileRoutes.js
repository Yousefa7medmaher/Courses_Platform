import express from 'express';
import { auth } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import {
  validateProfileUpdate,
  validatePasswordChange,
  validateAccountDeletion,
  handleValidationErrors
} from '../middlewares/validation.js';
import profileController from '../controllers/profileController.js';

const router = express.Router();

// Apply authentication to all profile routes
router.use(auth);

/**
 * @route   GET /profile
 * @desc    Show user profile page
 * @access  Private
 */
router.get('/', profileController.showProfile);

/**
 * @route   GET /api/profile
 * @desc    Get user profile data (API)
 * @access  Private
 */
router.get('/api', profileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/api', validateProfileUpdate, profileController.updateProfile);

/**
 * @route   POST /profile
 * @desc    Update user profile (form submission)
 * @access  Private
 */
router.post('/', validateProfileUpdate, profileController.updateProfile);

/**
 * @route   POST /api/profile/photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post('/api/photo', 
  uploadImage.single('photo'),
  profileController.uploadPhoto
);

/**
 * @route   POST /profile/photo
 * @desc    Upload profile photo (form submission)
 * @access  Private
 */
router.post('/photo', 
  uploadImage.single('photo'),
  profileController.uploadPhoto
);

/**
 * @route   PUT /api/profile/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/api/password', 
  validatePasswordChange, 
  profileController.changePassword
);

/**
 * @route   POST /profile/password
 * @desc    Change user password (form submission)
 * @access  Private
 */
router.post('/password', 
  validatePasswordChange, 
  profileController.changePassword
);

/**
 * @route   DELETE /api/profile
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/api', 
  validateAccountDeletion, 
  profileController.deleteAccount
);

/**
 * @route   POST /profile/delete
 * @desc    Delete user account (form submission)
 * @access  Private
 */
router.post('/delete', 
  validateAccountDeletion, 
  profileController.deleteAccount
);

/**
 * @route   GET /api/profile/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/api/stats', profileController.getUserStats);

export default router;
