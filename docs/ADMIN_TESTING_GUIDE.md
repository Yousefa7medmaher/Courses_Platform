# 🧪 Admin Panel Testing Guide

## 🚀 Quick Start

### 1. **Start Your Server**
```bash
npm run dev
```
Wait for the server to start on `https://localhost:5011`

### 2. **Run Automated Tests**
```bash
# Run the complete test suite
node run-admin-tests.js

# Or run individual tests:
node create-admin-user.js    # Create test users
node test-admin-access.js    # Test access controls
```

## 🔧 What We Fixed

### ✅ **Issues Resolved:**
1. **Missing `adminInstructorsPage` controller** - Added complete instructor management
2. **Undefined variables in templates** - Added fallback data for all admin pages
3. **Missing instructor route** - Added `/admin/instructors` route
4. **Access control improvements** - Enhanced authorization middleware
5. **Missing courses page** - Created complete course management page

### 📁 **Files Updated:**
- `controllers/webController.js` - Added instructor controller and improved dashboard
- `routes/webRoutes.js` - Added instructor route and health check
- `middlewares/auth.js` - Enhanced access denied handling
- `views/admin/*.ejs` - Fixed all undefined variable issues

## 🧪 Test Results Expected

### **Automated Tests:**
- ✅ Unauthenticated users redirected/denied
- ✅ Access denied page displays correctly
- ✅ Admin users can access all admin pages
- ✅ Regular users denied access to admin pages
- ✅ Dashboard loads with proper data

### **Manual Tests:**

#### **1. Admin Login Test**
```
URL: https://localhost:5011/login
Credentials:
  Email: admin@example.com
  Password: admin123
Expected: Successful login, redirect to dashboard
```

#### **2. Admin Dashboard Test**
```
URL: https://localhost:5011/admin/dashboard
Expected:
  ✅ Statistics cards with numbers
  ✅ Navigation sidebar
  ✅ Recent users table
  ✅ Quick action buttons
  ✅ Responsive design
```

#### **3. User Management Test**
```
URL: https://localhost:5011/admin/users
Expected:
  ✅ Users table with sample data
  ✅ Search functionality
  ✅ Filter dropdowns
  ✅ Create user modal
  ✅ Action buttons (edit, delete, toggle)
```

#### **4. Instructor Management Test**
```
URL: https://localhost:5011/admin/instructors
Expected:
  ✅ Instructors table
  ✅ Approval workflow buttons
  ✅ Status badges
  ✅ Profile view modal
  ✅ Permission management
```

#### **5. Course Management Test**
```
URL: https://localhost:5011/admin/courses
Expected:
  ✅ Courses table with thumbnails
  ✅ Category and status filters
  ✅ Publish/unpublish functionality
  ✅ Course statistics
```

#### **6. Access Control Test**
```
Test 1: Unauthenticated Access
  - Visit admin pages without login
  - Expected: Redirect to login or access denied

Test 2: Regular User Access
  - Login as: user@example.com / user123
  - Try accessing admin pages
  - Expected: Access denied page

Test 3: Instructor Access
  - Login as: instructor@example.com / instructor123
  - Try accessing admin pages
  - Expected: Access denied page
```

## 🎯 Test Users Created

The test script creates these users:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@example.com | admin123 | Full admin access |
| Student | user@example.com | user123 | No admin access |
| Instructor | instructor@example.com | instructor123 | No admin access |

## 🔍 Troubleshooting

### **Common Issues:**

#### **1. Server Not Starting**
```bash
# Check if port is in use
netstat -ano | findstr :5011

# Kill process if needed
taskkill /PID <PID> /F

# Restart server
npm run dev
```

#### **2. Database Connection Issues**
```bash
# Check MongoDB connection
# Verify .env file has correct MONGODB_URI
# Ensure MongoDB service is running
```

#### **3. Admin Pages Show Errors**
```bash
# Check server logs for specific errors
# Verify all admin template files exist
# Check if user has admin role in database
```

#### **4. Login Fails**
```bash
# Run user creation script again
node create-admin-user.js

# Check if users exist in database
# Verify password hashing is working
```

#### **5. Access Denied Page Not Showing**
```bash
# Check if views/admin/access-denied.ejs exists
# Verify authorization middleware is working
# Check route protection
```

## 📊 Performance Tests

### **Load Testing:**
```bash
# Test with multiple concurrent users
# Check memory usage during admin operations
# Verify database query performance
```

### **Security Testing:**
```bash
# Test SQL injection attempts
# Verify CSRF protection
# Check session management
# Test role escalation attempts
```

## 🎨 UI/UX Testing

### **Responsive Design:**
- ✅ Mobile sidebar collapse
- ✅ Table horizontal scroll
- ✅ Touch-friendly buttons
- ✅ Readable text on small screens

### **Accessibility:**
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast compliance
- ✅ Focus indicators

### **Browser Compatibility:**
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 📈 Monitoring

### **Metrics to Track:**
- Page load times
- Database query performance
- Memory usage
- Error rates
- User session duration

### **Logs to Monitor:**
- Authentication attempts
- Admin actions performed
- Database errors
- Security violations

## 🚀 Production Readiness

### **Before Going Live:**
1. **Security Review**
   - Change default passwords
   - Enable HTTPS
   - Configure CSRF protection
   - Set up rate limiting

2. **Performance Optimization**
   - Enable database indexing
   - Configure caching
   - Optimize images
   - Minify assets

3. **Monitoring Setup**
   - Error tracking
   - Performance monitoring
   - Security alerts
   - Backup procedures

## 📞 Support

If you encounter issues:

1. **Check server logs** for specific error messages
2. **Verify database connection** and user roles
3. **Run the test suite** to identify specific problems
4. **Check browser console** for JavaScript errors
5. **Review network tab** for failed requests

## 🎉 Success Criteria

Your admin panel is working correctly if:

- ✅ All automated tests pass
- ✅ Admin users can access all admin pages
- ✅ Non-admin users are properly denied access
- ✅ All CRUD operations work
- ✅ Responsive design functions on mobile
- ✅ No JavaScript errors in browser console
- ✅ Database operations complete successfully

**Happy Testing! 🎯**
