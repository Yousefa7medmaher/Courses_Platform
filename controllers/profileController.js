import authService from '../services/authService.js';
import User from '../models/usermodel.js';
import path from 'path';
import fs from 'fs';

class ProfileController {
  /**
   * Show profile page
   * @route GET /profile
   * @access Private
   */
  async showProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/');
      }

      res.render('pages/profile', {
        title: 'My Profile | JooCourses',
        user,
        activeSection: req.query.section || 'personal'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      req.flash('error', 'Error loading profile');
      res.redirect('/');
    }
  }

  /**
   * Get user profile data (API)
   * @route GET /api/profile
   * @access Private
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving profile'
      });
    }
  }

  /**
   * Update user profile
   * @route PUT /api/profile
   * @access Private
   */
  async updateProfile(req, res) {
    try {
      const { name, phone, bio, location } = req.body;
      const userId = req.user.id;

      // Validate input
      if (name && name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long'
        });
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone.trim() || null;
      if (bio !== undefined) updateData.bio = bio.trim();
      if (location !== undefined) updateData.location = location.trim();

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Handle both API and web requests
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: { user }
        });
      }

      req.flash('success', 'Profile updated successfully!');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error updating profile'
        });
      }

      req.flash('error', 'Error updating profile');
      res.redirect('/profile');
    }
  }

  /**
   * Upload profile photo
   * @route POST /api/profile/photo
   * @access Private
   */
  async uploadPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old photo if it exists and is not a default/placeholder
      if (user.photo && user.photo.startsWith('/uploads/')) {
        const oldPhotoPath = path.join(process.cwd(), 'public', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
          try {
            fs.unlinkSync(oldPhotoPath);
          } catch (err) {
            console.warn('Could not delete old photo:', err.message);
          }
        }
      }

      // Update user with new photo path
      const photoUrl = req.file.path || `/uploads/${req.file.filename}`;
      user.photo = photoUrl;
      await user.save();

      // Return updated user without password
      const updatedUser = await User.findById(userId).select('-password');

      res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: { 
          user: updatedUser,
          photoUrl: photoUrl
        }
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading photo'
      });
    }
  }

  /**
   * Change user password
   * @route PUT /api/profile/password
   * @access Private
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password and confirmation do not match'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password must be different from current password'
        });
      }

      // Use auth service to change password
      await authService.changePassword(userId, currentPassword, newPassword);

      // Handle both API and web requests
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Password changed successfully'
        });
      }

      req.flash('success', 'Password changed successfully!');
      res.redirect('/profile?section=security');
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Error changing password'
        });
      }

      req.flash('error', error.message || 'Error changing password');
      res.redirect('/profile?section=security');
    }
  }

  /**
   * Delete user account
   * @route DELETE /api/profile
   * @access Private
   */
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to delete account'
        });
      }

      // Get user with password for verification
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify password
      const isPasswordValid = await user.isPasswordValid(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }

      // Delete user photo if it exists
      if (user.photo && user.photo.startsWith('/uploads/')) {
        const photoPath = path.join(process.cwd(), 'public', user.photo);
        if (fs.existsSync(photoPath)) {
          try {
            fs.unlinkSync(photoPath);
          } catch (err) {
            console.warn('Could not delete user photo:', err.message);
          }
        }
      }

      // Delete user account
      await User.findByIdAndDelete(userId);

      // Handle both API and web requests
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Account deleted successfully'
        });
      }

      // Clear session/cookies and redirect
      req.flash('success', 'Your account has been deleted successfully');
      res.clearCookie('token');
      res.redirect('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting account'
        });
      }

      req.flash('error', 'Error deleting account');
      res.redirect('/profile');
    }
  }

  /**
   * Get user statistics (for profile dashboard)
   * @route GET /api/profile/stats
   * @access Private
   */
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Basic stats that apply to all users
      const stats = {
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        role: user.role,
        profileCompletion: this.calculateProfileCompletion(user)
      };

      // Role-specific stats can be added here
      if (user.role === 'instructor') {
        // Add instructor-specific stats
        const { default: CourseModel } = await import('../models/coursemodel.js');
        const instructorCourses = await CourseModel.find({ instructor: userId });
        
        stats.totalCourses = instructorCourses.length;
        stats.publishedCourses = instructorCourses.filter(c => c.status === 'published').length;
        stats.totalStudents = instructorCourses.reduce((sum, course) => sum + course.totalStudents, 0);
      } else if (user.role === 'student') {
        // Add student-specific stats
        const { default: CourseModel } = await import('../models/coursemodel.js');
        const enrolledCourses = await CourseModel.find({ studentsEnrolled: userId });
        
        stats.enrolledCourses = enrolledCourses.length;
        stats.completedCourses = 0; // This would need completion tracking
      }

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user statistics'
      });
    }
  }

  /**
   * Calculate profile completion percentage
   * @param {Object} user - User object
   * @returns {number} Completion percentage
   */
  calculateProfileCompletion(user) {
    const fields = ['name', 'email', 'phone', 'photo', 'bio'];
    const completedFields = fields.filter(field => {
      const value = user[field];
      return value && value.toString().trim().length > 0;
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  }
}

export default new ProfileController();
