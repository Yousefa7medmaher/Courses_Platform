import authService from '../services/authService.js';

class UserController {
  async getAllUsers(req, res) {
    try {
      const filters = {
        role: req.query.role,
        search: req.query.search
      };

      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await authService.getAllUsers(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await authService.getUserById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const updateData = { ...req.body };

      if (req.file) {
        updateData.photo = req.file.path || `/uploads/${req.file.filename}`;
      }

      const user = await authService.updateUserProfile(req.params.id, updateData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      if (req.params.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const User = (await import('../models/usermodel.js')).default;
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;

      if (!role || !['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Valid role is required (student, instructor, or admin)'
        });
      }

      if (req.params.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }

      const User = (await import('../models/usermodel.js')).default;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserStats(req, res) {
    try {
      const User = (await import('../models/usermodel.js')).default;
      const CourseModel = (await import('../models/coursemodel.js')).default;

      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        recentUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'instructor' }),
        User.countDocuments({ role: 'admin' }),
        CourseModel.countDocuments(),
        User.find()
          .select('-password')
          .sort({ createdAt: -1 })
          .limit(10)
      ]);

      const stats = {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        recentUsers
      };

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error retrieving user stats:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new UserController();
