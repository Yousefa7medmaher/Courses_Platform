import express from "express";
import { verifyRefreshToken } from './middlewares/auth.js';
import upload from "./middlewares/upload.js";
import passport from './config/passport.js'; 
import login from './controllers/auth/login.js';
import register from './controllers/auth/register.js';
import { addUser  , showAllUsers ,updateUser , changePassword ,deleteUser } from './controllers/userController.js';
const router = express.Router();



router.post('/api/addUser' , upload.single("photo") ,   addUser); 
router.get('/api/users',  showAllUsers); 
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
  
export default router;