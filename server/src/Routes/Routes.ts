import { Router, Request,Response } from "express";
import * as user from "../Controller/userController";


const router = Router();

// Sign-up route
router.post('/signup',user.postUser);

// Login route
router.post('/login',user.postLogin)


export default router;
