import express from "express";
const router = express.Router();
import { adduser  , showAllUsers ,updateUser , changePassword } from './controllers/userApi.js';

router.post('/api/addUser',  adduser); 
router.get('/api/users',  showAllUsers); 
router.put('/api/updateUser/:id',  updateUser); 
router.patch('/api/changePassword/:id',  changePassword); 

export default router;
