# Course Platform - Complete Node.js Learning Management System

A comprehensive course platform built with Node.js, Express.js, MongoDB, and EJS, similar to Udemy. Features include user authentication, course management, video uploads, student enrollment, ratings, and role-based access control.

## 🚀 Features

### Authentication & Authorization
- ✅ **JWT Authentication**: Secure login/logout with JSON Web Tokens
- ✅ **Role-based Access**: Student, Instructor, and Admin roles
- ✅ **Social Login**: Google OAuth integration
- ✅ **Password Security**: Bcrypt hashing with validation

### Course Management
- ✅ **Full CRUD Operations**: Create, read, update, delete courses
- ✅ **Rich Course Content**: Lessons, videos, descriptions, and metadata
- ✅ **File Uploads**: Cloudinary integration for images and videos
- ✅ **Course Status**: Draft, pending, and published states
- ✅ **Search & Filtering**: Advanced course discovery

### Student Features
- ✅ **Course Enrollment**: Easy enrollment system
- ✅ **Progress Tracking**: Track learning progress
- ✅ **Ratings & Reviews**: Rate and review courses
- ✅ **Student Dashboard**: Personalized learning dashboard

### Instructor Features
- ✅ **Instructor Dashboard**: Comprehensive course management
- ✅ **Lesson Management**: Add, edit, delete lessons
- ✅ **Video Management**: Upload and organize course videos
- ✅ **Student Analytics**: View enrolled students and statistics

### Technical Features
- ✅ **Responsive Design**: Mobile-first responsive UI
- ✅ **Real-time Validation**: Client and server-side validation
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Flash Messages**: User feedback system
- ✅ **SEO Optimized**: Proper meta tags and structure

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer + Cloudinary
- **Validation**: Express-validator
- **Security**: Bcrypt, CORS, Helmet

### Frontend
- **Template Engine**: EJS
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **JavaScript**: Vanilla JS for interactivity

### Development
- **Environment**: dotenv
- **Process Manager**: Nodemon
- **Linting**: ESLint
- **Version Control**: Git

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (optional, for file uploads)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd course-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/course_platform
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/course_platform

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Session Configuration
SESSION_SECRET=your_session_secret_key_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=https://localhost:5000
```

### 4. Start the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at `https://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
```

### Course Endpoints
```
GET    /api/courses                    # Get all published courses
GET    /api/courses/:id                # Get course details
POST   /api/instructor/courses         # Create new course (Instructor)
PUT    /api/instructor/courses/:id     # Update course (Instructor)
DELETE /api/instructor/courses/:id     # Delete course (Instructor)
```

### Student Endpoints
```
POST /api/courses/:id/enroll    # Enroll in course
POST /api/courses/:id/rate      # Rate and review course
```

### Lesson Management
```
POST   /api/instructor/courses/:id/lessons           # Add lesson
PUT    /api/instructor/courses/:id/lessons/:lessonId # Update lesson
DELETE /api/instructor/courses/:id/lessons/:lessonId # Delete lesson
```

### Video Management
```
POST   /api/instructor/courses/:id/videos           # Add video
PUT    /api/instructor/courses/:id/videos/:videoId  # Update video
DELETE /api/instructor/courses/:id/videos/:videoId  # Delete video
```

## 🌐 Web Routes

### Public Routes
```
GET /                    # Home page
GET /courses            # Course listing
GET /courses/:id        # Course details
GET /login              # Login page
GET /register           # Registration page
```

### Protected Routes
```
GET /dashboard                        # Role-based dashboard redirect
GET /student/dashboard               # Student dashboard
GET /instructor/dashboard            # Instructor dashboard
GET /instructor/courses/new          # Create course form
GET /instructor/courses/:id/edit     # Edit course form
GET /instructor/courses/:id/lessons  # Manage lessons
GET /instructor/courses/:id/videos   # Manage videos
```

## 👥 User Roles & Permissions

### Student
- Browse and search courses
- Enroll in courses
- Rate and review courses
- Access enrolled course content
- View personal dashboard

### Instructor
- All student permissions
- Create and manage courses
- Add/edit/delete lessons and videos
- View course analytics
- Manage enrolled students

### Admin
- All instructor permissions
- Manage all users and courses
- Access admin dashboard
- System-wide analytics

## 🔧 Development

### Available Scripts
```bash
npm run dev     # Start development server
npm start       # Start production server
npm run lint    # Run ESLint
npm test        # Run tests (if configured)
```

### Code Style Guidelines
- ES6+ JavaScript with async/await
- Modular architecture
- Comprehensive error handling
- Input validation on both client and server
- RESTful API design
- Semantic HTML structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the robust database
- Cloudinary for file upload services
- Font Awesome for icons
- Google Fonts for typography

---

**Built with ❤️ using Node.js, Express.js, and MongoDB**
