import express from "express";
const router = express.Router();
import { adduser  , showAllUsers} from './controllers/userApi.js';

router.post('/api/addUser',  adduser); 
router.get('/api/users',  showAllUsers); 

export default router;
