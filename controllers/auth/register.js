import User from '../../models/usermodel.js';
import bcrypt from 'bcrypt';
import validator from 'validator';

/**
 * Register a new user in the system.
 *
 * @param {Object} req - Express request object containing user registration data (name, email, phone, password, role)
 * @param {Object} res - Express response object for sending responses
 * @param {Function} next - Express next middleware function for error handling
 *
 * The goal of this method is to create a new user account after validating the input data.
 */
const register = async (req, res, next) => {
    try {
        // Destructure role first, then phone after email
        const { role, name, email, phone, password } = req.body;

        // Validate required fields
        if (!role || !name || !email || !phone || !password) {
            return res.status(400).json({ message: "Please provide role, name, email, phone, and password." });
        }

        // Validate role
        if (!['student', 'instructor', 'manager'].includes(role)) {
            return res.status(400).json({ message: "Role must be either student, instructor, or manager." });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Validate phone format (allow empty or valid phone)
        if (phone && !validator.isMobilePhone(phone + '', 'any', { strictMode: false })) {
            return res.status(400).json({ message: "Invalid phone number." });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
 

        // Create and save the new user
        const newUser = new User({
            role,
            name,
            email,
            phone,
            password: password,
            authType: 'local'
        });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        next(err);
    }
};

export default register;