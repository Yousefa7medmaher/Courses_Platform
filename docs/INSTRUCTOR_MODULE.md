# Instructor Module Documentation

## Overview

The Instructor Module is a comprehensive system that allows instructors to manage their courses, track performance, and interact with students. It provides a complete dashboard with analytics, course management tools, and content creation capabilities.

## Features

### 🎯 Core Features
- **Dashboard with Analytics**: Real-time statistics and performance metrics
- **Course Management**: Full CRUD operations for courses
- **Content Management**: Manage lessons, videos, and course materials
- **Student Tracking**: Monitor enrollments and student progress
- **Revenue Analytics**: Track earnings and course performance
- **Review Management**: View and respond to student reviews

### 📊 Dashboard Features
- Total courses, students, and revenue statistics
- Average rating and review counts
- Recent course activity
- Top-performing courses
- Enrollment trends
- Rating distribution charts

### 🎓 Course Management
- Create, edit, and delete courses
- Publish/unpublish courses
- Course status management (draft, pending, published)
- Image upload and management
- Tag and category management
- Pricing and duration settings

## Architecture

### File Structure
```
├── controllers/
│   └── instructorController.js     # Main instructor controller
├── services/
│   └── instructorService.js        # Business logic layer
├── routes/
│   └── instructorRoutes.js         # Route definitions
├── views/instructor/
│   ├── dashboard.ejs               # Main dashboard
│   ├── courses.ejs                 # Course list view
│   ├── course-form.ejs             # Create/edit course form
│   ├── course-details.ejs          # Course details with analytics
│   ├── lessons.ejs                 # Lesson management
│   └── videos.ejs                  # Video management
└── middlewares/
    └── validation.js               # Enhanced validation rules
```

### Components

#### 1. InstructorController
Handles HTTP requests and responses for instructor operations:
- Dashboard data retrieval
- Course CRUD operations
- Form rendering
- Status management

#### 2. InstructorService
Contains business logic for:
- Data aggregation and analytics
- Permission checking
- Course operations
- Statistics calculation

#### 3. Routes
Defines endpoints for:
- Web routes (HTML responses)
- API routes (JSON responses)
- Protected routes with authentication

## API Endpoints

### Web Routes
```
GET    /instructor/dashboard              # Dashboard page
GET    /instructor/courses                # Course list page
GET    /instructor/courses/new            # Create course form
POST   /instructor/courses                # Create course
GET    /instructor/courses/:id            # Course details
GET    /instructor/courses/:id/edit       # Edit course form
PUT    /instructor/courses/:id            # Update course
DELETE /instructor/courses/:id            # Delete course
POST   /instructor/courses/:id/toggle-publish  # Toggle publish status
```

### API Routes
```
GET    /api/instructor/dashboard          # Dashboard data (JSON)
GET    /api/instructor/courses            # Course list (JSON)
POST   /api/instructor/courses            # Create course (JSON)
GET    /api/instructor/courses/:id        # Course details (JSON)
PUT    /api/instructor/courses/:id        # Update course (JSON)
DELETE /api/instructor/courses/:id        # Delete course (JSON)
```

## Authentication & Authorization

### Role-Based Access
- Only users with `instructor` or `admin` roles can access instructor routes
- Instructors can only manage their own courses
- Admins can manage all courses

### Middleware Stack
```javascript
router.use(auth);                        // Authentication required
router.use(authorize('instructor', 'admin')); // Role authorization
```

### Permission Checks
- Course ownership verification
- Role-based access control
- Data filtering by instructor ID

## Data Models

### Course Data Structure
```javascript
{
  title: String,           // Course title
  description: String,     // Course description
  category: String,        // Course category
  level: String,          // Difficulty level
  price: Number,          // Course price
  duration: Number,       // Course duration in hours
  status: String,         // draft, pending, published
  featured: Boolean,      // Featured course flag
  tags: [String],         // Course tags
  imageUrl: String,       // Course image URL
  instructor: ObjectId,   // Instructor reference
  lessons: [Object],      // Course lessons
  videos: [Object],       // Course videos
  studentsEnrolled: [ObjectId], // Enrolled students
  ratings: [Object],      // Course ratings and reviews
  // Analytics fields
  totalStudents: Number,
  averageRating: Number,
  totalReviews: Number,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Course Creation
- Title: 5-200 characters, required
- Description: 20-2000 characters, required
- Category: Must be from predefined list, required
- Level: Beginner/Intermediate/Advanced, required
- Price: Positive number, required
- Duration: Minimum 0.5 hours, optional
- Tags: Maximum 10 tags, optional

### Course Updates
- All fields optional for updates
- Same validation rules apply when provided
- Image upload validation (max 5MB, image formats only)

## Security Features

### Input Validation
- Server-side validation using express-validator
- XSS protection through input sanitization
- File upload restrictions and validation

### Access Control
- JWT-based authentication
- Role-based authorization
- Course ownership verification
- CSRF protection on forms

### Data Protection
- Instructor data isolation
- Secure file uploads
- SQL injection prevention (MongoDB)

## Testing

### Test Setup
Run the instructor module test:
```bash
node scripts/test-instructor-module.js setup
```

### Test Credentials
- Email: `instructor@test.com`
- Password: `instructor123`
- Role: `instructor`

### Test Data
The test creates:
- 1 instructor user
- 3 sample courses (published, draft, pending)
- Analytics data for testing

### Cleanup
Remove test data:
```bash
node scripts/test-instructor-module.js cleanup
```

## Usage Examples

### Creating a Course
1. Navigate to `/instructor/courses/new`
2. Fill in course details
3. Upload course image (optional)
4. Set status (draft/pending/published)
5. Submit form

### Managing Courses
1. View all courses at `/instructor/courses`
2. Filter by status, search by title
3. Sort by date, students, rating
4. Quick actions: edit, publish, delete

### Dashboard Analytics
1. Access dashboard at `/instructor/dashboard`
2. View key metrics and statistics
3. Monitor recent activity
4. Track top-performing courses

## Error Handling

### Common Errors
- **403 Forbidden**: User not authorized (wrong role)
- **404 Not Found**: Course not found or access denied
- **400 Bad Request**: Validation errors
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
// Redirects with flash messages
req.flash('error', 'Error message');
res.redirect('/instructor/courses');
```

## Performance Considerations

### Database Optimization
- Indexed queries on instructor field
- Pagination for large course lists
- Aggregation pipelines for analytics

### Caching Strategy
- Course data caching
- Dashboard statistics caching
- Image optimization and CDN

### Frontend Optimization
- Lazy loading for course images
- Pagination for better performance
- AJAX for quick actions

## Future Enhancements

### Planned Features
- Bulk course operations
- Advanced analytics dashboard
- Student communication tools
- Course templates
- Revenue reporting
- Export functionality

### Integration Points
- Payment processing
- Email notifications
- File storage (AWS S3)
- Video streaming
- Analytics tracking

## Troubleshooting

### Common Issues
1. **Routes not working**: Check if instructor routes are properly imported in app.js
2. **Permission denied**: Verify user role and authentication
3. **Validation errors**: Check input data format and requirements
4. **Image upload fails**: Verify file size and format restrictions

### Debug Mode
Enable debug logging:
```javascript
// In development
process.env.NODE_ENV = 'development';
```

### Logs
Check server logs for:
- Authentication errors
- Validation failures
- Database connection issues
- File upload problems

## Contributing

### Code Style
- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for functions
- Include error handling

### Testing
- Write unit tests for new features
- Test both web and API endpoints
- Verify permission checks
- Test edge cases

### Documentation
- Update this README for new features
- Add inline code comments
- Document API changes
- Include usage examples
