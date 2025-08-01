import express from "express";
const router = express.Router();
import upload from "./middlewares/upload.js";
import { adduser  , showAllUsers ,updateUser , changePassword ,deleteUser } from './controllers/userApi.js';
import passport from './config/passport.js'; 

import login from './controllers/auth/login.js';
import register from './controllers/auth/register.js';

router.post('/api/addUser' , upload.single("img_profile") ,   adduser); 
router.get('/api/users',  showAllUsers); 
router.put('/api/updateUser/:id',  updateUser); 
router.patch('/api/changePassword/:id',  changePassword); 

router.delete('/api/deleteUser/:id' , deleteUser);

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
      res.redirect('/profile'); // عدّل حسب ما تحب
    }
  );
  
  // Optional: Logout route
  router.get('/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });
  
export default router;