import authService from '../services/authService.js';

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  async register(req, res) {
    try {
      const user = await authService.registerUser(req.body);

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: { user }
        });
      }

      req.flash('success', 'Registration successful! Please login.');
      res.redirect('/login');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', error.message);
      res.redirect('/register');
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);

      // Set HTTP-only cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: result.user,
            token: result.token
          }
        });
      }

      // For web routes, redirect based on role
      req.flash('success', 'Login successful!');
      if (result.user.role === 'instructor') {
        return res.redirect('/instructor/dashboard');
      } else if (result.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/student/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      req.flash('error', error.message);
      res.redirect('/login');
    }
  }

  /**
   * Logout user
   * @route POST /api/auth/logout
   * @access Private
   */
  async logout(req, res) {
    try {
      // Clear the token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      }

      req.flash('success', 'Logged out successfully!');
      res.redirect('/');
    } catch (error) {
      console.error('Logout error:', error);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          message: 'Logout failed'
        });
      }

      req.flash('error', 'Logout failed');
      res.redirect('/');
    }
  }

  /**
   * Get current user profile
   * @route GET /api/auth/me
   * @access Private
   */
  async getProfile(req, res) {
    try {
      const user = await authService.getUserById(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   * @route PUT /api/auth/profile
   * @access Private
   */
  async updateProfile(req, res) {
    try {
      // Handle file upload
      if (req.file) {
        req.body.photo = req.file.path || `/uploads/${req.file.filename}`;
      }

      const user = await authService.updateUserProfile(req.user.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Change user password
   * @route PUT /api/auth/change-password
   * @access Private
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Refresh JWT token
   * @route POST /api/auth/refresh-token
   * @access Public
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token and generate new access token
      const decoded = authService.verifyToken(refreshToken);
      const user = await authService.getUserById(decoded.id);
      const newToken = authService.generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          user
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
}

export default new AuthController();
