import dotenv from 'dotenv';
dotenv.config();

import User from '../../models/usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Generate Access Token - short lived (15 min)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate Refresh Token - long lived (7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide both email and password.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.authType !== 'local')
      return res.status(400).json({ message: 'Please login using your Google or Facebook account.' });

    if (!user.password)
      return res.status(400).json({ message: 'Password not set for this account.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    // ✅ Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // ✅ Send refreshToken in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // ✅ Send accessToken + user info in body
    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo || null
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default login;
