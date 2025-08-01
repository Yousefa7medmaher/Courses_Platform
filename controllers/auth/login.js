import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables

import User from '../../usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Handles user login via local strategy (email & password)
 * Returns JWT on success
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 🔍 Validate input presence
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    // 🔍 Find user by email, include password explicitly (as it's hidden by default)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ⚠️ Block login for accounts created with Google or Facebook
    if (user.authType !== 'local') {
      return res.status(400).json({ message: "Please login using your Google or Facebook account." });
    }

    // ❌ Check if password is missing
    if (!user.password) {
      return res.status(400).json({ message: "Password not set for this account." });
    }

    // 🔐 Compare entered password with hashed one in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 🔑 Generate JWT token for the authenticated user
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Respond with token and user info
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo || null
      }
    });

  } catch (err) {
    console.error('Login error:', err); // 🐞 Log internal error
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default login;
