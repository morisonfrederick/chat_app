import { Router, Request,Response } from "express";
import * as user from "../Controller/userController";
import verifyToken from "../middlewares/tokenverfication";


const router = Router();

// Sign-up route
router.post('/signup',user.postUser);

// Login route
router.post('/login',user.postLogin)

// search friends 

router.post('/find',verifyToken,user.findFrinds)

// add friends 
router.post('/friendrequest',verifyToken,user.sendfriendRequset)

//get friend request 
router.get('/requests',verifyToken,user.getFrendRequset)

//accept friend request 
router.post('/managefriends',verifyToken,user.manageFriendRequest)


export default router;
