import User from '../models/usermodel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Add a new user to the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function adduser(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const img_profile = req.file ? req.file.path : req.body.img_profile || "";

        if (!name || !email || !password) {
            return sendResponse(res, 400, "Please enter all fields.");
        }

        if (!validator.isEmail(email)) {
            return sendResponse(res, 400, "Please enter a valid email format.");
        }

        if (password.length < 6) {
            return sendResponse(res, 400, "Password must be at least 6 characters long.");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 409, "Email is already used.");
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            img_profile
        });

        return sendResponse(res, 201, "User created successfully.", {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            img_profile: newUser.img_profile
        });

    } catch (err) {
        next(err);
    }
}

/**
 * Controller to fetch and return all users.
 */
async function showAllUsers(req, res, next) {
    try {
        const users = await User.find({}, '_id name email img_profile role').lean();
        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            img_profile: user.img_profile,
            role: user.role
        }));
        return sendResponse(res, 200, "Show all users", formattedUsers);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller to update a user's information.
 */
async function updateUser(req, res, next) {
    try {
        const user_id = req.params.id;
        const { name, email } = req.body;

        const existingUser = await User.findById(user_id);
        if (!existingUser) {
            return sendResponse(res, 404, "User does not exist");
        }

        let updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            updateFields,
            { new: true, runValidators: true }
        );

        return sendResponse(res, 200, "User updated successfully", {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
        });

    } catch (err) {
        next(err);
    }
}

/**
 * Change a user's password.
 */
async function changePassword(req, res, next) {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return sendResponse(res, 400, "All password fields (current, new, confirm) are required");
        }

        if (newPassword !== confirmPassword) {
            return sendResponse(res, 400, "New password and confirm password do not match");
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, "User does not exist");
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return sendResponse(res, 401, "Current password is incorrect");
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        return sendResponse(res, 200, "Password updated successfully");
    } catch (err) {
        next(err);
    }
}

async function deleteUser(req, res, next) {
    try {
        const userId = req.params.id;

        if (!userId) {
            return sendResponse(res, 400, "User ID parameter is required");
        }

        const user = await User.findById(userId);

        if (!user) {
            return sendResponse(res, 404, "User not found");
        }

        await User.findByIdAndDelete(userId);

        return sendResponse(res, 200, "User deleted successfully");
    } catch (err) {
        next(err);
    }
}

export { adduser, showAllUsers, updateUser, changePassword, deleteUser };
