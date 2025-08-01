import User from '../../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Login a user and return a JWT token if credentials are valid.
 * 
 * @param {Object} req - Express request object containing user login data (email, password)
 * @param {Object} res - Express response object for sending responses
 * @param {Function} next - Express next middleware function for error handling
 * 
 * This function authenticates a user by verifying the provided email and password.
 * If authentication is successful, it returns a JWT token.
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if both email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password." });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Do not reveal whether the email exists for security reasons
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Generate JWT token with userId as payload
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Respond with the token and user info (excluding password)
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                img_profile: user.img_profile || null
            }
        });
    } catch (err) {
        next(err);
    }
};

export default login;