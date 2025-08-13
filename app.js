import express from 'express';
import dotenv from 'dotenv';
// import cors from 'cors';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import router from './routes/router.js';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import routerCourse from './routes/routeCourse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
app.use(express.json());

// add ejs 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));


// Add expressLayouts 
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

app.use(express.static('public'));

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
app.use(router);
app.use('/courses/',routerCourse)
const PORT = process.env.PORT || 5000;

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
