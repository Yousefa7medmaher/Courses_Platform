# Profile Module Documentation

## Overview

The Profile Module provides comprehensive user profile management functionality, allowing users to view and update their personal information, upload profile photos, change passwords with security verification, and manage account settings.

## Features

### 🎯 Core Features
- **Profile Information Display**: View user details with profile image
- **Personal Information Management**: Update name, phone, bio, and location
- **Profile Photo Upload**: Upload and manage profile pictures with validation
- **Secure Password Change**: Change password with current password verification
- **Account Statistics**: View profile completion and user statistics
- **Role-based Features**: Different features based on user role (student, instructor, admin)

### 🔒 Security Features
- **Password Verification**: Current password required for password changes
- **Input Validation**: Server-side validation for all profile updates
- **File Upload Security**: Image validation and size limits
- **Authentication Required**: All profile operations require authentication

## Architecture

### File Structure
```
├── controllers/
│   └── profileController.js        # Main profile controller
├── routes/
│   └── profileRoutes.js           # Profile route definitions
├── views/pages/
│   └── profile.ejs                # Profile page view
├── public/
│   ├── js/profile.js              # Profile JavaScript functionality
│   └── css/profile.css            # Profile styling
├── middlewares/
│   └── validation.js              # Enhanced validation rules
└── scripts/
    └── test-profile-module.js     # Testing utilities
```

### Components

#### 1. ProfileController
Handles all profile-related operations:
- Profile page rendering
- Profile data retrieval and updates
- Photo upload management
- Password change with verification
- Account deletion with security checks
- User statistics calculation

#### 2. Profile Routes
Defines endpoints for both web and API access:
- Web routes for page rendering
- API routes for AJAX operations
- Form submission handling
- File upload endpoints

## API Endpoints

### Web Routes
```
GET    /profile                    # Profile page
POST   /profile                    # Update profile (form)
POST   /profile/photo              # Upload photo (form)
POST   /profile/password           # Change password (form)
POST   /profile/delete             # Delete account (form)
```

### API Routes
```
GET    /api/profile                # Get profile data (JSON)
PUT    /api/profile                # Update profile (JSON)
POST   /api/profile/photo          # Upload photo (JSON)
PUT    /api/profile/password       # Change password (JSON)
DELETE /api/profile                # Delete account (JSON)
GET    /api/profile/stats          # Get user statistics (JSON)
```

## Data Model

### User Profile Fields
```javascript
{
  name: String,           // Full name (required)
  email: String,          // Email address (readonly)
  phone: String,          // Phone number (optional)
  bio: String,            // User biography (max 500 chars)
  location: String,       // User location (max 100 chars)
  photo: String,          // Profile photo URL
  role: String,           // User role (student, instructor, admin)
  createdAt: Date,        // Account creation date
  lastLogin: Date,        // Last login timestamp
  // Security fields
  password: String,       // Hashed password (hidden)
  authType: String,       // Authentication type
  // Additional fields...
}
```

## Validation Rules

### Profile Update
- **Name**: 2-100 characters, required
- **Phone**: Valid phone number format, optional
- **Bio**: Maximum 500 characters, optional
- **Location**: Maximum 100 characters, optional

### Password Change
- **Current Password**: Required for verification
- **New Password**: Minimum 6 characters, must contain:
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
- **Confirm Password**: Must match new password

### Photo Upload
- **File Type**: Image formats only (jpg, png, gif, webp)
- **File Size**: Maximum 5MB
- **Dimensions**: Recommended 400x400px or larger

## Security Features

### Password Security
- **Bcrypt Hashing**: Passwords hashed with salt rounds
- **Current Password Verification**: Required for password changes
- **Password Strength Requirements**: Enforced complexity rules
- **Secure Storage**: Passwords excluded from query results

### File Upload Security
- **File Type Validation**: Only image files allowed
- **Size Limitations**: 5MB maximum file size
- **Path Sanitization**: Secure file path handling
- **Old File Cleanup**: Previous photos automatically deleted

### Access Control
- **Authentication Required**: All routes protected
- **User Ownership**: Users can only modify their own profiles
- **Input Sanitization**: XSS protection on all inputs

## User Interface

### Profile Page Sections
1. **Profile Sidebar**
   - Profile photo with upload button
   - User information display
   - Role badge and location
   - Member statistics

2. **Personal Information**
   - Name, phone, bio, location fields
   - Real-time form validation
   - Save/reset functionality

3. **Security Settings**
   - Password change form
   - Password strength indicator
   - Security options (future: 2FA)

4. **Role-specific Sections**
   - Instructor profile settings
   - Student preferences
   - Admin tools

### Interactive Features
- **Photo Upload**: Drag-and-drop or click to upload
- **Password Visibility**: Toggle password visibility
- **Form Validation**: Real-time client-side validation
- **Progress Indicators**: Loading states for operations
- **Flash Messages**: Success/error notifications

## Testing

### Test Setup
Run the profile module test:
```bash
node scripts/test-profile-module.js setup
```

### Test Credentials
- **Student**: `student@profile.test` / `student123`
- **Instructor**: `instructor@profile.test` / `instructor123`
- **Admin**: `admin@profile.test` / `admin123`

### Test Features
The test creates users with complete profiles and validates:
- Profile completion calculation (80% for test users)
- Password hashing and validation
- Required and optional field handling
- Role-based functionality

### Security Testing
Test password security features:
```bash
node scripts/test-profile-module.js security
```

### Cleanup
Remove test data:
```bash
node scripts/test-profile-module.js cleanup
```

## Usage Examples

### Viewing Profile
1. Navigate to `/profile`
2. View current profile information
3. Check profile completion percentage
4. See role-specific features

### Updating Profile
1. Click on Personal Information section
2. Modify name, phone, bio, or location
3. Click "Save Changes"
4. See success confirmation

### Uploading Photo
1. Click "Change Photo" button
2. Select image file (max 5MB)
3. Photo uploads automatically
4. Profile image updates immediately

### Changing Password
1. Go to Security section
2. Enter current password
3. Enter new password (meeting requirements)
4. Confirm new password
5. Submit form for verification

## Error Handling

### Common Errors
- **401 Unauthorized**: User not logged in
- **400 Bad Request**: Validation errors
- **413 Payload Too Large**: File size exceeds limit
- **415 Unsupported Media Type**: Invalid file type
- **500 Internal Server Error**: Server-side errors

### Error Responses
```javascript
// API Error Response
{
  success: false,
  message: "Error description",
  errors: [...] // Validation errors if applicable
}

// Web Error Response
// Flash message displayed on page
req.flash('error', 'Error message');
```

## Performance Considerations

### File Upload Optimization
- Image compression on client-side
- Progressive upload with progress indicators
- Automatic old file cleanup
- CDN integration ready

### Database Optimization
- Indexed queries on user ID
- Selective field updates
- Password field exclusion from queries

### Frontend Optimization
- Lazy loading for profile sections
- Debounced form validation
- Optimistic UI updates
- Cached profile data

## Future Enhancements

### Planned Features
- Two-factor authentication (2FA)
- Social media profile links
- Profile visibility settings
- Account export functionality
- Profile themes/customization

### Integration Points
- Email verification for email changes
- SMS verification for phone changes
- Social login profile sync
- Activity logging
- Notification preferences

## Troubleshooting

### Common Issues
1. **Photo upload fails**: Check file size and format
2. **Password change rejected**: Verify current password
3. **Validation errors**: Check input requirements
4. **Profile not updating**: Check network connection

### Debug Mode
Enable detailed logging:
```javascript
// In development
process.env.NODE_ENV = 'development';
```

### Logs
Check server logs for:
- Authentication errors
- Validation failures
- File upload issues
- Database connection problems

## Contributing

### Code Style
- Follow existing naming conventions
- Add JSDoc comments for functions
- Include error handling
- Write unit tests for new features

### Testing
- Test both web and API endpoints
- Verify security measures
- Test file upload edge cases
- Check responsive design

### Documentation
- Update this README for new features
- Add inline code comments
- Document API changes
- Include usage examples
