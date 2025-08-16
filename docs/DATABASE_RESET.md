# Database Reset Scripts

This document explains how to use the database reset scripts to clean and reseed your JooCourses database.

## Available Scripts

### 1. Interactive Reset (`npm run db:reset`)

**File:** `scripts/reset-database.js`

A comprehensive, interactive script that guides you through the database reset process with safety confirmations.

**Features:**
- Shows current database statistics
- Multiple confirmation prompts for safety
- Option to clear uploaded files
- Option to seed basic data
- Graceful error handling
- Detailed logging

**Usage:**
```bash
npm run db:reset
```

**Interactive Flow:**
1. Displays current database statistics
2. Asks for confirmation to delete all data
3. Requires double confirmation for safety
4. Optionally clears uploaded files
5. Optionally seeds basic data with sample users and courses

### 2. Quick Reset (`npm run db:quick-reset`)

**File:** `scripts/simple-reset.js`

A fast, non-interactive script that immediately resets the database and seeds basic data. Perfect for development.

**Features:**
- No prompts or confirmations
- Automatically seeds basic data
- Creates sample users and courses
- Fast execution for development workflow

**Usage:**
```bash
npm run db:quick-reset
```

**What it does:**
1. Deletes all data from database
2. Creates admin, instructor, and student users
3. Creates 5 sample courses across different categories
4. Creates a sample enrollment
5. Displays login credentials

### 3. Seed Only (`npm run db:seed`)

**Usage:**
```bash
npm run db:seed
```

This is an alias for `db:quick-reset` - it performs the same function.

## Default Users Created

After running either reset script with seeding, you'll have these default users:

### Admin User
- **Email:** admin@joocourses.com
- **Password:** admin123
- **Role:** admin
- **Permissions:** Full system access

### Instructor User
- **Email:** instructor@joocourses.com
- **Password:** instructor123
- **Role:** instructor
- **Permissions:** Can create and manage courses

### Student User
- **Email:** student@joocourses.com
- **Password:** student123
- **Role:** student
- **Permissions:** Can enroll in and view courses

## Sample Courses Created

The quick reset creates these sample courses:

1. **Introduction to Web Development** (Development, Beginner, Featured)
2. **Advanced React Development** (Development, Advanced)
3. **UI/UX Design Fundamentals** (Design, Beginner, Featured)
4. **Digital Marketing Mastery** (Marketing, Intermediate)
5. **Business Strategy & Planning** (Business, Intermediate)

## Safety Features

### Interactive Reset Safety
- **Double Confirmation:** Requires two separate confirmations
- **Statistics Display:** Shows what will be deleted
- **Graceful Cancellation:** Can be cancelled at any point
- **Ctrl+C Handling:** Safely handles interruption

### Data Validation
- **Connection Check:** Verifies database connection before proceeding
- **Error Handling:** Comprehensive error catching and reporting
- **Transaction Safety:** Uses proper MongoDB operations

## File Structure

```
scripts/
├── reset-database.js      # Interactive reset script
├── quick-reset.js         # Quick reset script
└── validate-image-system.js  # Image system validation

docs/
└── DATABASE_RESET.md      # This documentation
```

## Environment Requirements

The scripts use these environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/joocourses
```

If `MONGODB_URI` is not set, it defaults to `mongodb://localhost:27017/joocourses`.

## Usage Examples

### Development Workflow
```bash
# Quick reset for development
npm run db:quick-reset

# Start development server
npm run dev
```

### Production Setup
```bash
# Interactive reset with confirmations
npm run db:reset

# Follow prompts to seed initial data
```

### Testing Setup
```bash
# Reset database before tests
npm run db:quick-reset

# Run tests
npm test
```

## What Gets Deleted

Both scripts delete:
- ✅ All user accounts
- ✅ All courses
- ✅ All enrollments
- ✅ All other collections (except system collections)
- ✅ Database indexes (then recreated)
- ⚠️ Uploaded files (only if confirmed in interactive mode)

## What Gets Created (with seeding)

- ✅ 3 default users (admin, instructor, student)
- ✅ 5 sample courses across different categories
- ✅ 1 sample enrollment
- ✅ Proper database indexes

## Error Handling

The scripts handle common errors:

- **Connection Failures:** Clear error messages for MongoDB connection issues
- **Permission Errors:** Handles database permission problems
- **File System Errors:** Graceful handling of upload file deletion issues
- **Model Errors:** Catches and reports model validation errors

## Security Considerations

### Development vs Production
- **Development:** Use quick reset freely
- **Production:** Always use interactive reset with confirmations
- **Staging:** Use interactive reset to prevent accidents

### Password Security
- Default passwords are simple for development
- Change default passwords in production
- Consider using environment variables for default passwords

## Troubleshooting

### Common Issues

**"Connection failed"**
- Check if MongoDB is running
- Verify MONGODB_URI environment variable
- Check network connectivity

**"Permission denied"**
- Ensure MongoDB user has proper permissions
- Check database authentication settings

**"Cannot delete files"**
- Check file system permissions
- Ensure uploads directory exists
- Verify file locks are released

### Debug Mode

Add debug logging by setting environment variable:
```bash
DEBUG=true npm run db:reset
```

## Best Practices

1. **Always backup production data** before running reset scripts
2. **Use interactive mode** in production environments
3. **Test scripts** in development before using in production
4. **Document custom seeding** if you modify the scripts
5. **Use version control** to track script changes

## Customization

To customize the seeded data, modify the `seedBasicData()` function in either script:

```javascript
// Add custom users
const customUser = new User({
    name: 'Custom User',
    email: 'custom@example.com',
    password: 'password123',
    role: 'instructor'
});

// Add custom courses
const customCourse = new Course({
    title: 'Custom Course',
    description: 'Custom description',
    // ... other fields
});
```

## Integration with CI/CD

For automated testing environments:

```yaml
# Example GitHub Actions step
- name: Reset Database
  run: npm run db:quick-reset
  env:
    MONGODB_URI: ${{ secrets.TEST_MONGODB_URI }}
```

## Support

If you encounter issues with the database reset scripts:

1. Check the error messages in the console
2. Verify your MongoDB connection
3. Ensure proper permissions
4. Check the troubleshooting section above
5. Review the script source code for additional context
