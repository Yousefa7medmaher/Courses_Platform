# 🧪 Test Credentials for JooCourses Platform

## 📋 Ready-to-Use Test Accounts

### 👨‍🎓 Student Accounts
```
Email: john@test.com
Password: password123
Role: Student
```

```
Email: bob@test.com  
Password: simple123
Role: Student
```

### 👩‍🏫 Instructor Account
```
Email: jane@test.com
Password: password123
Role: Instructor
```

### 🔧 Additional Test Account
```
Email: test@example.com
Password: password123
Role: Student
```

## 🚀 How to Test

### 1. Login Testing
1. Go to: https://localhost:5011/login
2. Use any of the credentials above
3. Should redirect to dashboard after successful login

### 2. Registration Testing
1. Go to: https://localhost:5011/register
2. Fill out the form with new data:
   - **Name**: Any full name (e.g., "Test User")
   - **Email**: Any unique email (e.g., "newuser@test.com")
   - **Phone**: Optional (e.g., "123-456-7890")
   - **Password**: At least 6 characters (e.g., "test123")
   - **Confirm Password**: Same as password
   - **Role**: Choose "Student" or "Instructor"
   - **Terms**: Check the checkbox
3. Click "Create Account"
4. Should redirect to login page with success message

### 3. Error Testing

#### Duplicate Email Registration
1. Try to register with an existing email (e.g., john@test.com)
2. Should show error: "User already exists with this email"

#### Wrong Login Credentials
1. Try to login with wrong password
2. Should show error: "Invalid email or password"

## ✅ What Was Fixed

### 1. Password Validation
- **Before**: Required uppercase, lowercase, and numbers (too strict)
- **After**: Only requires 6+ characters (user-friendly)

### 2. Form Submission
- **Before**: JavaScript tried to submit to API endpoint
- **After**: Form submits normally to web endpoint with proper redirects

### 3. Authentication Flow
- **Before**: Double password hashing caused login failures
- **After**: Single password hashing with proper validation

### 4. Error Handling
- **Before**: Poor error feedback
- **After**: Clear flash messages for all scenarios

## 🎯 Simple Test Data Templates

### For Registration Form:
```
Name: Test User
Email: user@test.com
Phone: (optional)
Password: test123
Confirm Password: test123
Role: Student
Terms: ✓ Checked
```

### For Login Form:
```
Email: john@test.com
Password: password123
```

## 🔍 Troubleshooting

### If Login Fails:
1. Check that you're using the exact credentials above
2. Make sure password is case-sensitive
3. Check server logs for errors

### If Registration Fails:
1. Make sure email is unique
2. Check that password is at least 6 characters
3. Ensure terms checkbox is checked
4. Verify all required fields are filled

### If Server Issues:
1. Restart the server: `node app.js`
2. Check MongoDB connection
3. Verify port 5011 is available

## 📝 Notes

- All passwords are simple for testing purposes
- In production, use stronger password requirements
- Test accounts can be cleaned up using: `node scripts/test-registration.js clean`
- Server runs on HTTPS at port 5011
- Flash messages appear at the top of pages for feedback
