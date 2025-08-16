// Admin Routes Example
// This shows how to set up routes for the admin panel

import express from 'express';
import { 
    adminDashboard, 
    adminUsers, 
    adminInstructors, 
    requireAdmin 
} from '../controllers/adminController.js';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
};

// Apply authentication middleware to all admin routes
router.use(requireAuth);

// Admin Dashboard
router.get('/dashboard', requireAdmin, adminDashboard);

// User Management
router.get('/users', requireAdmin, adminUsers);

// Instructor Management  
router.get('/instructors', requireAdmin, adminInstructors);

// API Routes for CRUD operations

// User CRUD operations
router.post('/users', requireAdmin, async (req, res) => {
    try {
        // Create new user logic here
        const { name, email, password, role, status } = req.body;
        
        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be provided' 
            });
        }
        
        // Create user in database
        // const newUser = await User.create({ name, email, password, role, status });
        
        res.json({ 
            success: true, 
            message: 'User created successfully',
            // user: newUser 
        });
        
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create user' 
        });
    }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Update user in database
        // const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        
        res.json({ 
            success: true, 
            message: 'User updated successfully',
            // user: updatedUser 
        });
        
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user' 
        });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete user from database
        // await User.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user' 
        });
    }
});

// Instructor CRUD operations
router.post('/instructors', requireAdmin, async (req, res) => {
    try {
        const { name, email, password, specialization, experience, status, permissions } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and password are required' 
            });
        }
        
        // Create instructor in database
        // const newInstructor = await Instructor.create({ 
        //     name, email, password, specialization, experience, status, permissions 
        // });
        
        res.json({ 
            success: true, 
            message: 'Instructor created successfully',
            // instructor: newInstructor 
        });
        
    } catch (error) {
        console.error('Create instructor error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create instructor' 
        });
    }
});

router.put('/instructors/:id/approve', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Approve instructor in database
        // const instructor = await Instructor.findByIdAndUpdate(
        //     id, 
        //     { status: 'active' }, 
        //     { new: true }
        // );
        
        res.json({ 
            success: true, 
            message: 'Instructor approved successfully',
            // instructor: instructor 
        });
        
    } catch (error) {
        console.error('Approve instructor error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to approve instructor' 
        });
    }
});

router.put('/instructors/:id/reject', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Reject instructor in database
        // const instructor = await Instructor.findByIdAndUpdate(
        //     id, 
        //     { status: 'rejected' }, 
        //     { new: true }
        // );
        
        res.json({ 
            success: true, 
            message: 'Instructor application rejected',
            // instructor: instructor 
        });
        
    } catch (error) {
        console.error('Reject instructor error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reject instructor' 
        });
    }
});

// Bulk operations
router.post('/users/bulk', requireAdmin, async (req, res) => {
    try {
        const { action, userIds } = req.body;
        
        if (!action || !userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Action and user IDs are required' 
            });
        }
        
        let updateData = {};
        switch (action) {
            case 'activate':
                updateData = { status: 'active' };
                break;
            case 'deactivate':
                updateData = { status: 'inactive' };
                break;
            case 'delete':
                // Handle bulk delete
                // await User.deleteMany({ _id: { $in: userIds } });
                return res.json({ 
                    success: true, 
                    message: `${userIds.length} users deleted successfully` 
                });
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid action' 
                });
        }
        
        // Update users in database
        // const result = await User.updateMany(
        //     { _id: { $in: userIds } }, 
        //     updateData
        // );
        
        res.json({ 
            success: true, 
            message: `${userIds.length} users ${action}d successfully`,
            // modifiedCount: result.modifiedCount 
        });
        
    } catch (error) {
        console.error('Bulk operation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to perform bulk operation' 
        });
    }
});

// Status toggle endpoint
router.put('/users/:id/toggle-status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get current user status
        // const user = await User.findById(id);
        // const newStatus = user.status === 'active' ? 'inactive' : 'active';
        
        // Update user status
        // const updatedUser = await User.findByIdAndUpdate(
        //     id, 
        //     { status: newStatus }, 
        //     { new: true }
        // );
        
        res.json({ 
            success: true, 
            message: `User status updated successfully`,
            // newStatus: updatedUser.status 
        });
        
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to toggle user status' 
        });
    }
});

// Export router
export default router;
