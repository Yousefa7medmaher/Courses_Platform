import express from "express";
const router = express.Router();
import { adduser  } from './controllers/userApi.js';

router.post('/api/addUser',  adduser); 
export default router;
