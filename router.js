import express from "express";
const router = express.Router();
import { adduser  , showAllUsers ,updateUser , changePassword ,deleteUser } from './controllers/userApi.js';

router.post('/api/addUser',  adduser); 
router.get('/api/users',  showAllUsers); 
router.put('/api/updateUser/:id',  updateUser); 
router.patch('/api/changePassword/:id',  changePassword); 

router.delete('/api/deleteUser/:id' , deleteUser)
export default router;
