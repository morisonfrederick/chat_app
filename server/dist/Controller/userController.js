"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUser = postUser;
exports.postLogin = postLogin;
exports.findFrinds = findFrinds;
exports.sendfriendRequset = sendfriendRequset;
exports.getFrendRequset = getFrendRequset;
exports.manageFriendRequest = manageFriendRequest;
exports.listFriends = listFriends;
exports.addProfilePic = addProfilePic;
exports.getProfilePic = getProfilePic;
// userController.ts
const userModel_1 = require("../Model/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const JWT_SECRET = process.env.JWT_SECRET;
function postUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password } = req.body;
            if (!username || !password || !email) {
                res.status(400).json({ message: "All fields are required" });
                return;
            }
            const userExist = yield userModel_1.User.findOne({ email });
            if (userExist) {
                res.status(400).json({ message: "User with the same email exists" });
                return;
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const newUser = new userModel_1.User({
                username,
                email,
                password: hashedPassword,
            });
            yield newUser.save();
            res.status(201).json({ message: "User added successfully" });
            return;
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    });
}
function postLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json("all fields are required");
                return;
            }
            let user = yield userModel_1.User.findOne({ email });
            if (!user) {
                res.status(400).json("no user found");
                return;
            }
            let validUser = yield bcryptjs_1.default.compare(password, user.password);
            if (!validUser) {
                res.status(400).json("invalid credentials");
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, {
                expiresIn: "1h",
            });
            res.status(200).json({
                message: "user logged in successful",
                token,
                user: { email: user.email, id: user._id, name: user.username },
            });
        }
        catch (error) { }
    });
}
function postLogout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = req.body;
    });
}
//function to search friends
function findFrinds(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { search } = req.body;
            const friends = search
                ? yield userModel_1.User.find({ username: { $regex: search, $options: "i" } })
                : yield userModel_1.User.find();
            const filteredFriends = friends.filter((friend) => {
                return (!friend.friends.includes(userID) &&
                    !friend.friendRequests.includes(userID) &&
                    friend._id != userID);
            });
            res.status(200).json(filteredFriends);
        }
        catch (error) {
            console.log(error);
            res.status(500).json("an error occured while searching for friends");
        }
    });
}
function sendfriendRequset(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //destructure and validate input
            const { friendId, userString } = req.body;
            if (!friendId || !userString) {
                res
                    .status(400)
                    .json({ error: "user id of both user and friend is required" });
                return;
            }
            //parse the userString
            const userObject = JSON.parse(userString);
            //find and validate the user and friend
            const user = (yield userModel_1.User.findById(userObject.id));
            const friend = yield userModel_1.User.findById(friendId);
            if (!user || !friend) {
                res.status(400).json("user or friend  not found");
                return;
            }
            //checking friend request is exist in the friend request array
            if (friend.friendRequests.includes(userObject.id)) {
                res.status(400).json({ error: "Friend request already send" });
                return;
            }
            // checking if already friends
            if (user.friends.includes(friendId)) {
                res
                    .status(400)
                    .json({ message: " cant't send friend request to friends" });
            }
            //add user id to the friend request list and save
            friend.friendRequests.push(userObject.id);
            yield friend.save();
            //send success response
            res.status(200).json({ message: "user request send successfully" });
            return;
        }
        catch (error) {
            console.log(error);
        }
    });
}
// function to display friend requests recieved from friends
function getFrendRequset(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            //destructure and validate input
            const id = req.query.id;
            if (!id) {
                res.status(400).json({ error: "user id is required" });
                return;
            }
            //get the user and friend request array and validate
            const user = yield userModel_1.User.findById(id);
            if (!user) {
                res.status(400).json({ error: "no user found for the id provided" });
                return;
            }
            if (!(user === null || user === void 0 ? void 0 : user.friendRequests.length)) {
                res.status(200).json({ message: "no friend request available" });
                return;
            }
            if ((_a = user === null || user === void 0 ? void 0 : user.friendRequests) === null || _a === void 0 ? void 0 : _a.length) {
                //retrieve all friends request from the friends array
                let friendsArray = yield Promise.all(user.friendRequests.map((id) => __awaiter(this, void 0, void 0, function* () {
                    let friend = yield userModel_1.User.findById(id);
                    return friend;
                })));
                res.status(200).json({ data: friendsArray });
                return;
            }
            res.status(400).json({ error: "some error happend" });
        }
        catch (error) {
            console.log(error);
        }
    });
}
//function to accept or reject the friend request
function manageFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Destructure the friendId, userId, and option from the request body
            const { friendId, userId, option } = req.body;
            // Validate required fields
            if (!friendId || !userId) {
                res.status(400).json({ message: "friendId and/or userId is missing" });
                return;
            }
            // Fetch users from the database
            const user = yield userModel_1.User.findById(userId);
            const friend = yield userModel_1.User.findById(friendId);
            if (!user || !friend) {
                res
                    .status(400)
                    .json({ message: "One or both users are no longer available" });
                return;
            }
            // Function to retrieve all friend requests as user objects
            const getFriendRequests = () => __awaiter(this, void 0, void 0, function* () {
                return Promise.all(user.friendRequests.map((id) => __awaiter(this, void 0, void 0, function* () {
                    return yield userModel_1.User.findById(id);
                })));
            });
            if (option === "reject") {
                // Remove friendId from user's friend requests
                user.friendRequests = user.friendRequests.filter((id) => id !== friendId);
                yield user.save();
                const friendsArray = yield getFriendRequests();
                res
                    .status(200)
                    .json({ data: friendsArray, message: "Rejected successfully" });
                return;
            }
            if (option === "accept") {
                // Check if friend is already in user's friends list
                if (user.friends.includes(friendId)) {
                    res.status(400).json({ message: "Already friends" });
                    return;
                }
                // Remove friendId from friendRequests and add to friends lists
                user.friendRequests = user.friendRequests.filter((id) => id !== friendId);
                user.friends.push(friendId);
                friend.friends.push(userId);
                yield user.save();
                yield friend.save();
                const friendsArray = yield getFriendRequests();
                res
                    .status(200)
                    .json({ data: friendsArray, message: "Friend added successfully" });
                return;
            }
            res.status(400).json({ message: "Invalid option provided" });
        }
        catch (error) {
            console.error("Error in manageFriendRequest:", error);
            res.status(500).json({ message: "Server error", error });
        }
    });
}
//function to display friends
function listFriends(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Get user ID from the request, set by the JWT middleware
            const userID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const user = yield userModel_1.User.findById(userID);
            // Check if the user and friends exist
            if (!user || !((_b = user.friends) === null || _b === void 0 ? void 0 : _b.length)) {
                res.status(400).json("No friends found for this user");
                return;
            }
            // Make an array of friends with name and email
            const friends = yield Promise.all(user.friends.map((id) => __awaiter(this, void 0, void 0, function* () {
                const friend = (yield userModel_1.User.findById(id));
                return { name: friend.username, id: friend._id, url: friend.imageURL };
            })));
            res.status(200).json({ friends });
        }
        catch (error) {
            console.error(error);
            res.status(500).json("Server error");
        }
    });
}
//function to save image url in the database
function addProfilePic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const url = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
            if (!url) {
                res.status(400).json({ error: "no profile pic uploaded" });
                return;
            }
            let user = yield userModel_1.User.findById((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!user) {
                res.status(400).json({ error: "no user found " });
                return;
            }
            // delete profile pic if already exist
            if (user.imageURL) {
                const filePath = path_1.default.join(__dirname, "../public/uploads", user.imageURL);
                fs_1.default.unlink(filePath, (err) => {
                    if (err)
                        console.log("error deleting prev profile pic : ", err);
                });
            }
            user.imageURL = url;
            yield user.save();
            res.status(200).json({ message: "profile pic added successfully", url });
        }
        catch (error) {
            console.log(error);
        }
    });
}
function getProfilePic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!id) {
                res.status(400).json({ error: "no user found" });
                return;
            }
            const user = yield userModel_1.User.findById(id);
            if (!user) {
                res.status(400).json({ error: "no user found " });
                return;
            }
            let profileURL = user === null || user === void 0 ? void 0 : user.imageURL;
            res.status(200).json({ profileURL });
            return;
        }
        catch (error) {
            res.status(500).json(error);
            return;
        }
    });
}
