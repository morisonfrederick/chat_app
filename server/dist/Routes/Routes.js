"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user = __importStar(require("../Controller/userController"));
const admin = __importStar(require("../Controller/adminController"));
const tokenverfication_1 = __importDefault(require("../middlewares/tokenverfication"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const messageController_1 = __importDefault(require("../Controller/messageController"));
const router = (0, express_1.Router)();
// Sign-up route
router.post("/signup", user.postUser);
// Login route
router.post("/login", user.postLogin);
// search friends
router.post("/find", tokenverfication_1.default, user.findFrinds);
// add friends
router.post("/friendrequest", tokenverfication_1.default, user.sendfriendRequset);
//get friend request
router.get("/requests", tokenverfication_1.default, user.getFrendRequset);
//accept friend request
router.post("/managefriends", tokenverfication_1.default, user.manageFriendRequest);
// list all the available friends
router.get("/friendlist", tokenverfication_1.default, user.listFriends);
//delete all users for test purpose
router.post("/deleteusers", admin.deleteUsers);
router.post("/uploads", tokenverfication_1.default, multer_1.default.single("profilePIC"), user.addProfilePic);
router.get("/profile", tokenverfication_1.default, user.getProfilePic);
// router to retrieve saved messages
router.post("/messages", tokenverfication_1.default, messageController_1.default);
exports.default = router;
