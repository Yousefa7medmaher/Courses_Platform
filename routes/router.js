import express from "express";
import { verifyRefreshToken } from '../middlewares/auth.js';
import upload from "../middlewares/upload.js";
import passport from '../config/passport.js'; 
import login from '../controllers/auth/login.js';
import register from '../controllers/auth/register.js';
import { addUser  , showAllUsers ,getUserById,updateUser , changePassword ,deleteUser, profile , updateImg } from '../controllers/userController.js';
const router = express.Router();
import {authenticate} from '../middlewares/auth.js';
import multer from "multer";
import { createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse} from '../controllers/courseController.js';



router.post('/api/addUser' , upload.single("photo") ,   addUser); 
router.get('/api/users',  showAllUsers); 
router.get('/api/users/me',authenticate,  profile); 

router.patch('/api/users/updateimg/:id', (req, res, next) => {
  upload.single('photo')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateImg);


router.put('/api/updateUser/:id',  updateUser); 
router.patch('/api/changePassword/:id',  changePassword); 

router.delete('/api/deleteUser/:id' , deleteUser);

router.get('/refresh-token', verifyRefreshToken, (req, res) => {
  const accessToken = jwt.sign(
      { id: req.user.id },  
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
  );

  res.json({ accessToken });
});
// Auth 
router.post('/api/register', register); 
router.post('/api/login' , login);


// ✅ Google OAuth routes

// Step 1: Redirect user to Google for authentication
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  // Step 2: Google redirects back to this route after login
  router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // 🔁 بعد تسجيل الدخول بنجاح، المستخدم يروح لصفحة معينة
      res.redirect('http://127.0.0.1:5500/index.html'); // عدّل حسب ما تحب
    }
  );
  
  // Optional: Logout route
  router.get('/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });


router.get('/', (req, res) => {
  res.render('index', { title: 'Home | JooCourses' });
});
 

router.get('/courses', (req, res) => {
  res.render('pages/courses', { title: 'courses | JooCourses' });
});

router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Contact | JooCourses' });
});

router.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Contact | JooCourses' });
});
export default router;