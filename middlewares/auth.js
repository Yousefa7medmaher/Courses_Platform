import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; 
import dotenv from 'dotenv';
dotenv.config();
/**
 * Middleware to authenticate user using JWT token.
 * Checks if the token is valid and attaches user info to req.user.
 */
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token missing or invalid.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // decoded should contain userId and possibly role
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

/**
 * Middleware to authorize user based on role(s).
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'User role not found. Access denied.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action.' });
        }
        next();
    };
}

export function verifyRefreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: 'Refresh token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = decoded; // فقط يحتوي على userId غالبًا
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid refresh token.' });
    }
}
