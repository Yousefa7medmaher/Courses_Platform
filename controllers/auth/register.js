import User from '../usermodel.js';  
import bcrypt from 'bcrypt';  
import validator from 'validator';

/**
 * Register a new user in the system.
 * 
 * @param {Object} req - Express request object containing user registration data (name, email, password)
 * @param {Object} res - Express response object for sending responses
 * @param {Function} next - Express next middleware function for error handling
 * 
 * The goal of this method is to create a new user account after validating the input data.
 */
const register = async (req, res, next) => { 
    try { 
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password." });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) { 
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    }
    catch (err) { 
        next(err);
    }
}