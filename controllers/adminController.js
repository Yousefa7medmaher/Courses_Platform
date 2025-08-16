// Admin Controller Example
// This shows how to properly pass data to the admin dashboard

// Example admin dashboard controller
export const adminDashboard = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user || req.user.role !== 'admin') {
            return res.render('admin/access-denied', {
                user: req.user || null,
                title: 'Access Denied'
            });
        }

        // Fetch dashboard statistics
        const stats = await getDashboardStats();
        
        // Fetch recent users (last 10)
        const recentUsers = await getRecentUsers(10);
        
        // Render dashboard with all required data
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.user,
            stats: stats,
            recentUsers: recentUsers,
            currentPage: 'dashboard'
        });
        
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).render('error', {
            message: 'Internal server error',
            error: error
        });
    }
};

// Helper function to get dashboard statistics
async function getDashboardStats() {
    try {
        // Replace with your actual database queries
        // Example using MongoDB/Mongoose:
        
        /*
        const User = require('../models/User');
        const Instructor = require('../models/Instructor');
        
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const totalInstructors = await Instructor.countDocuments();
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        const pendingInstructors = await Instructor.countDocuments({ status: 'pending' });
        */
        
        // For now, return sample data
        return {
            totalUsers: 1247,
            activeUsers: 1156,
            totalInstructors: 89,
            pendingUsers: 12,
            pendingInstructors: 5,
            notifications: 3
        };
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return default stats on error
        return {
            totalUsers: 0,
            activeUsers: 0,
            totalInstructors: 0,
            pendingUsers: 0,
            pendingInstructors: 0,
            notifications: 0
        };
    }
}

// Helper function to get recent users
async function getRecentUsers(limit = 10) {
    try {
        // Replace with your actual database query
        // Example using MongoDB/Mongoose:
        
        /*
        const User = require('../models/User');
        
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('name email role status createdAt avatar');
            
        return recentUsers;
        */
        
        // For now, return sample data
        return [
            {
                _id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'student',
                status: 'active',
                createdAt: new Date(),
                avatar: null
            },
            {
                _id: '507f1f77bcf86cd799439012',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                role: 'instructor',
                status: 'active',
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                avatar: null
            },
            {
                _id: '507f1f77bcf86cd799439013',
                name: 'Mike Chen',
                email: 'mike.chen@example.com',
                role: 'student',
                status: 'inactive',
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
                avatar: null
            },
            {
                _id: '507f1f77bcf86cd799439014',
                name: 'Emily Rodriguez',
                email: 'emily.rodriguez@example.com',
                role: 'instructor',
                status: 'pending',
                createdAt: new Date(Date.now() - 259200000), // 3 days ago
                avatar: null
            },
            {
                _id: '507f1f77bcf86cd799439015',
                name: 'David Kim',
                email: 'david.kim@example.com',
                role: 'student',
                status: 'active',
                createdAt: new Date(Date.now() - 345600000), // 4 days ago
                avatar: null
            }
        ];
        
    } catch (error) {
        console.error('Error fetching recent users:', error);
        return [];
    }
}

// User Management Controller
export const adminUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user || req.user.role !== 'admin') {
            return res.render('admin/access-denied', {
                user: req.user || null,
                title: 'Access Denied'
            });
        }

        // Fetch all users with pagination
        const users = await getAllUsers();
        const stats = await getDashboardStats();
        
        res.render('admin/users', {
            title: 'User Management',
            user: req.user,
            users: users,
            stats: stats,
            currentPage: 'users'
        });
        
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).render('error', {
            message: 'Internal server error',
            error: error
        });
    }
};

// Instructor Management Controller
export const adminInstructors = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user || req.user.role !== 'admin') {
            return res.render('admin/access-denied', {
                user: req.user || null,
                title: 'Access Denied'
            });
        }

        // Fetch all instructors
        const instructors = await getAllInstructors();
        const stats = await getDashboardStats();
        
        res.render('admin/instructors', {
            title: 'Instructor Management',
            user: req.user,
            instructors: instructors,
            stats: stats,
            currentPage: 'instructors'
        });
        
    } catch (error) {
        console.error('Admin instructors error:', error);
        res.status(500).render('error', {
            message: 'Internal server error',
            error: error
        });
    }
};

// Helper function to get all users
async function getAllUsers() {
    try {
        // Replace with your actual database query
        // Return sample data for now
        return [
            {
                _id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'student',
                status: 'active',
                createdAt: new Date(),
                avatar: null
            },
            {
                _id: '507f1f77bcf86cd799439012',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                role: 'instructor',
                status: 'active',
                createdAt: new Date(Date.now() - 86400000),
                avatar: null
            },
            // Add more sample users as needed
        ];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Helper function to get all instructors
async function getAllInstructors() {
    try {
        // Replace with your actual database query
        // Return sample data for now
        return [
            {
                _id: '507f1f77bcf86cd799439021',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                status: 'active',
                specialization: 'Web Development',
                experience: 'Expert (5+ years)',
                coursesCount: 12,
                createdAt: new Date(Date.now() - 86400000),
                avatar: null
            },
            {
                _id: '507f1f77bcf86cd799439022',
                name: 'Mike Chen',
                email: 'mike.chen@example.com',
                status: 'pending',
                specialization: 'Data Science',
                experience: 'Intermediate (3-5 years)',
                coursesCount: 0,
                createdAt: new Date(Date.now() - 172800000),
                avatar: null
            },
            // Add more sample instructors as needed
        ];
    } catch (error) {
        console.error('Error fetching instructors:', error);
        return [];
    }
}

// Middleware to check admin access
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.render('admin/access-denied', {
            user: req.user || null,
            title: 'Access Denied'
        });
    }
    next();
};

// Export all functions
export default {
    adminDashboard,
    adminUsers,
    adminInstructors,
    requireAdmin
};
