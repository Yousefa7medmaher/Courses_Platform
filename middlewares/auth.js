import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Enhanced authentication middleware that supports both API and web routes
 */
export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }
      return res.redirect('/login');
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.redirect('/login');
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      return res.redirect('/login');
    }

    if (!roles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      return res.status(403).render('error', {
        message: 'Access denied. Insufficient permissions.',
        error: { status: 403 }
      });
    }

    next();
  };
};

/**
 * Optional authentication (for pages that work with or without login)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Legacy authenticate function for backward compatibility
 */
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token missing or invalid.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

/**
 * Middleware to check if user is instructor and can manage courses
 */
export const isInstructorOrOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      return res.redirect('/login');
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Must be instructor
    if (req.user.role !== 'instructor') {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ message: 'Access denied. Instructor role required.' });
      }
      return res.status(403).render('error', {
        message: 'Access denied. Instructor role required.',
        error: { status: 403 }
      });
    }

    next();
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(500).json({ message: 'Server error' });
    }
    return res.status(500).render('error', {
      message: 'Server error',
      error: { status: 500 }
    });
  }
};

export function verifyRefreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: 'Refresh token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid refresh token.' });
    }
}

// Default export for backward compatibility
export default auth;
