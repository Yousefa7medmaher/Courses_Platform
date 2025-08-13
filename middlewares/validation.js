import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    // For web routes, flash errors and redirect back
    req.flash('error', errors.array().map(err => err.msg).join(', '));
    return res.redirect('back');
  }
  next();
};

// User validation rules
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Course validation rules
export const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Course title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Course description must be between 20 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['Development', 'Business', 'Finance & Accounting', 'IT & Software', 'Office Productivity', 'Personal Development', 'Design', 'Marketing', 'Lifestyle', 'Photography & Video', 'Health & Fitness', 'Music', 'Teaching & Academics'])
    .withMessage('Please select a valid category'),
  
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced'),
  
  body('duration')
    .isFloat({ min: 0.5 })
    .withMessage('Duration must be at least 0.5 hours'),
  
  // body('tags')
  //   .optional()
  //   .isArray({ max:50 })
  //   .withMessage('Maximum 10 tags allowed'),
  
  handleValidationErrors
];

export const validateCourseUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid course ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Course title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Course description must be between 20 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .optional()
    .isIn(['Development', 'Business', 'Finance & Accounting', 'IT & Software', 'Office Productivity', 'Personal Development', 'Design', 'Marketing', 'Lifestyle', 'Photography & Video', 'Health & Fitness', 'Music', 'Teaching & Academics'])
    .withMessage('Please select a valid category'),
  
  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced'),
  
  body('duration')
    .optional()
    .isFloat({ min: 0.5 })
    .withMessage('Duration must be at least 0.5 hours'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending', 'published'])
    .withMessage('Status must be draft, pending, or published'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),

  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Tags must be an array');
          }
          return true;
        } catch (e) {
          // If not JSON, treat as comma-separated string
          const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (tags.length > 10) {
            throw new Error('Maximum 10 tags allowed');
          }
          return true;
        }
      } else if (Array.isArray(value)) {
        if (value.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        return true;
      }
      throw new Error('Tags must be an array or comma-separated string');
    }),

  handleValidationErrors
];

// Lesson validation rules
export const validateLesson = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Lesson title must be between 3 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Lesson content must be at least 10 characters'),
  
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number (in minutes)'),
  
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid video URL'),
  
  handleValidationErrors
];

// Video validation rules
export const validateVideo = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Video title must be between 3 and 200 characters'),
  
  body('videoUrl')
    .isURL()
    .withMessage('Please provide a valid video URL'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive number (in minutes)'),
  
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  handleValidationErrors
];

// Rating validation rules
export const validateRating = [
  param('id')
    .isMongoId()
    .withMessage('Invalid course ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Search and filter validation
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isIn(['Development', 'Business', 'Finance & Accounting', 'IT & Software', 'Office Productivity', 'Personal Development', 'Design', 'Marketing', 'Lifestyle', 'Photography & Video', 'Health & Fitness', 'Music', 'Teaching & Academics'])
    .withMessage('Invalid category'),
  
  query('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid level'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  handleValidationErrors
];



// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        // Basic phone validation - you can make this more strict
        if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          throw new Error('Please provide a valid phone number');
        }
      }
      return true;
    }),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),

  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];

// Account deletion validation
export const validateAccountDeletion = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),

  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),

  handleValidationErrors
];
