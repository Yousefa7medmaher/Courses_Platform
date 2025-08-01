import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';
import router from './router.js';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for all routes and allow requests from the frontend and admin panel
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',      // frontend React مثلاً
  'http://127.0.0.1:3000',
];


app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Connect routing
app.use(router);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  });
};

startServer();