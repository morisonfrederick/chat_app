import { Router, Request, Response } from "express";
import * as user from "../Controller/userController";
import * as admin from "../Controller/adminController";
import verifyToken from "../middlewares/tokenverfication";
import upload from "../middlewares/multer";
import retrieveMsg from "../Controller/messageController";

const router = Router();

// Sign-up route
router.post("/signup", user.postUser);

// Login route
router.post("/login", user.postLogin);

// search friends

router.post("/find", verifyToken, user.findFrinds);

// add friends
router.post("/friendrequest", verifyToken, user.sendfriendRequset);

//get friend request
router.get("/requests", verifyToken, user.getFrendRequset);

//accept friend request
router.post("/managefriends", verifyToken, user.manageFriendRequest);

// list all the available friends
router.get("/friendlist", verifyToken, user.listFriends);

//delete all users for test purpose

router.post("/deleteusers", admin.deleteUsers);

router.post(
  "/uploads",
  verifyToken,
  upload.single("profilePIC"),
  user.addProfilePic
);
router.get("/profile", verifyToken, user.getProfilePic);

// router to retrieve saved messages

router.post("/messages", verifyToken, retrieveMsg);

export default router;
