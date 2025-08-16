import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';

// Import routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import webRoutes from './routes/webRoutes.js';
import { serveDefaultImage, addDefaultsToLocals } from './middlewares/imageDefaults.js';
import { addImageHelpersToLocals } from './utils/imageHelpers.js';
import { addImageSecurityHeaders } from './middlewares/imageSecurity.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for flash messages
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages middleware
app.use((req, res, next) => {
  req.flash = (type, message) => {
    if (!req.session.flash) req.session.flash = {};
    if (!req.session.flash[type]) req.session.flash[type] = [];
    req.session.flash[type].push(message);
  };

  res.locals.messages = req.session.flash || {};
  req.session.flash = {};
  next();
});

// EJS setup with express-ejs-layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false); // Disable view caching in development

// Express layouts configuration - MUST be before routes
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Static files with default image fallback and security headers
app.use(addImageSecurityHeaders);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(serveDefaultImage);

// Add image helpers to template locals
app.use(addDefaultsToLocals);
app.use(addImageHelpersToLocals);

// // CORS
// const allowedOrigins = [
//   'http://localhost:5500',
//   'http://127.0.0.1:5500',
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
// ];
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true
// }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/instructor', instructorRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/profile', profileRoutes);
app.use('/api/profile', profileRoutes);
app.use('/', webRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Error Handler:', err);
  console.error('🚨 Error message:', err.message);
  console.error('🚨 Error stack:', err.stack);
  console.error('🚨 Request URL:', req.originalUrl);

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Check if it's an admin route and disable layout
  const layoutSetting = req.originalUrl.startsWith('/admin/') ? false : undefined;

  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : { status: err.status || 500 },
    layout: layoutSetting
  });
});
const PORT = process.env.PORT || 5011;

// HTTPS setup
const httpsOptions = {
  key: fs.readFileSync('./certs/localhost-key.pem'),
  cert: fs.readFileSync('./certs/localhost.pem'),
};

const startServer = async () => {
  await connectDB();

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔐 HTTPS Server running at https://localhost:${PORT}`);
    // console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  });
};

startServer();
