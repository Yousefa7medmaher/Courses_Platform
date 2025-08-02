import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import connectDB from './db.js';
import router from './router.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

// Enable CORS
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Routes
app.use(router);

const PORT = process.env.PORT || 5000;

// Load HTTPS certificates
const httpsOptions = {
  key: fs.readFileSync('./certs/localhost-key.pem'),
  cert: fs.readFileSync('./certs/localhost.pem'),
};

const startServer = async () => {
  await connectDB();

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔐 HTTPS Server running at https://localhost:${PORT}`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  });
};

startServer();
