import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';
import router from './router.js';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

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
  });
};

startServer();
