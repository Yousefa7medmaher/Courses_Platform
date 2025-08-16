// Test admin view rendering directly
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express layouts configuration
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Test route
app.get('/test-admin', (req, res) => {
  try {
    console.log('🧪 Testing admin view rendering...');
    
    const testStats = {
      totalUsers: 6,
      activeUsers: 5,
      totalInstructors: 2,
      totalCourses: 6,
      pendingUsers: 0,
      pendingInstructors: 0,
      notifications: 3
    };
    
    const testUser = {
      _id: 'test-id',
      name: 'Test Admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    
    console.log('✅ Data prepared, rendering view...');
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard | Course Platform',
      stats: testStats,
      recentUsers: [],
      user: testUser,
      layout: false // Disable layout for admin pages
    });
    
    console.log('✅ View rendered successfully');
    
  } catch (error) {
    console.error('❌ Error rendering admin view:', error);
    res.status(500).send('Error: ' + error.message);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Error in test app:', err);
  res.status(500).send('Error: ' + err.message);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('🔗 Test admin view: http://localhost:3001/test-admin');
});
