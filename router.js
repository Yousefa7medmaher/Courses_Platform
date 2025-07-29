import express from "express";
const router = express.Router();
import { adduser  , showAllUsers ,updateUser } from './controllers/userApi.js';

router.post('/api/addUser',  adduser); 
router.get('/api/users',  showAllUsers); 
router.put('/api/updateUser/:id',  updateUser); 
router.patch('/api/changePassword/:id',  updateUser); 

export default router;
