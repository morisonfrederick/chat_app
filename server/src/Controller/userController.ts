// userController.ts
import { User, Iuser } from "../Model/userModel";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { log } from "console";

interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

async function postUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400).json({ message: "User with the same email exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

async function postLogin(req: Request, res: Response): Promise<void> {
  log;
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json("all fields are required");
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      res.status(400).json("no user found");
      return;
    }
    let validUser = await bcrypt.compare(password, user.password);
    if (!validUser) {
      res.status(400).json("invalid credentials");
      return;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "user logged in successful",
      token,
      user: { email: user.email, id: user._id, name: user.username },
    });
  } catch (error) {}
}

async function postLogout(req: Request, res: Response): Promise<void> {
  const { token } = req.body;
}
//function to search friends
async function findFrinds(req: CustomRequest, res: Response): Promise<void> {
  try {
    const userID = req.user?.id as string;

    const { search } = req.body;
    const friends = search
      ? await User.find({ username: { $regex: search, $options: "i" } })
      : await User.find();

    const filteredFriends = friends.filter((friend) => {
      return (
        !friend.friends.includes(userID) &&
        !friend.friendRequests.includes(userID) &&
        friend._id != userID
      );
    });

    res.status(200).json(filteredFriends);
  } catch (error) {
    console.log(error);
    res.status(500).json("an error occured while searching for friends");
  }
}

async function sendfriendRequset(req: Request, res: Response) {
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
    const user = (await User.findById(userObject.id)) as Iuser;
    const friend = await User.findById(friendId);
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
    await friend.save();

    //send success response
    res.status(200).json({ message: "user request send successfully" });
    return;
  } catch (error) {
    console.log(error);
  }
}

// function to display friend requests recieved from friends
async function getFrendRequset(req: Request, res: Response) {
  try {
    //destructure and validate input
    const id = req.query.id;

    if (!id) {
      res.status(400).json({ error: "user id is required" });
      return;
    }

    //get the user and friend request array and validate
    const user = await User.findById(id);

    if (!user) {
      res.status(400).json({ error: "no user found for the id provided" });
      return;
    }
    if (!user?.friendRequests.length) {
      res.status(200).json({ message: "no friend request available" });
      return;
    }

    if (user?.friendRequests?.length) {
      //retrieve all friends request from the friends array
      let friendsArray = await Promise.all(
        user.friendRequests.map(async (id: string) => {
          let friend = await User.findById(id);
          return friend;
        })
      );

      res.status(200).json({ data: friendsArray });
      return;
    }
    res.status(400).json({ error: "some error happend" });
  } catch (error) {
    console.log(error);
  }
}
//function to accept or reject the friend request
async function manageFriendRequest(req: Request, res: Response) {
  try {
    // Destructure the friendId, userId, and option from the request body
    const { friendId, userId, option } = req.body;

    // Validate required fields
    if (!friendId || !userId) {
      res.status(400).json({ message: "friendId and/or userId is missing" });
      return;
    }

    // Fetch users from the database
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      res
        .status(400)
        .json({ message: "One or both users are no longer available" });
      return;
    }

    // Function to retrieve all friend requests as user objects
    const getFriendRequests = async () => {
      return Promise.all(
        user.friendRequests.map(async (id: string) => {
          return await User.findById(id);
        })
      );
    };

    if (option === "reject") {
      // Remove friendId from user's friend requests
      user.friendRequests = user.friendRequests.filter((id) => id !== friendId);
      await user.save();

      const friendsArray = await getFriendRequests();
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

      await user.save();
      await friend.save();

      const friendsArray = await getFriendRequests();
      res
        .status(200)
        .json({ data: friendsArray, message: "Friend added successfully" });
      return;
    }

    res.status(400).json({ message: "Invalid option provided" });
  } catch (error) {
    console.error("Error in manageFriendRequest:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

//function to display friends

async function listFriends(req: CustomRequest, res: Response) {
  try {
    // Get user ID from the request, set by the JWT middleware
    const userID = req.user?.id;
    const user = await User.findById(userID);

    // Check if the user and friends exist
    if (!user || !user.friends?.length) {
      res.status(400).json("No friends found for this user");
      return;
    }

    // Make an array of friends with name and email
    const friends = await Promise.all(
      user.friends.map(async (id) => {
        const friend = (await User.findById(id)) as Iuser;
        return { name: friend.username, id: friend._id, url: friend.imageURL };
      })
    );

    res.status(200).json({ friends });
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
}

//function to save image url in the database

async function addProfilePic(req: CustomRequest, res: Response) {
  try {
    const url = req.file?.filename;

    if (!url) {
      res.status(400).json({ error: "no profile pic uploaded" });
      return;
    }

    let user = await User.findById(req?.user?.id);
    if (!user) {
      res.status(400).json({ error: "no user found " });
      return;
    }

    // delete profile pic if already exist
    if (user.imageURL) {
      const filePath = path.join(__dirname, "../public/uploads", user.imageURL);
      fs.unlink(filePath, (err) => {
        if (err) console.log("error deleting prev profile pic : ", err);
      });
    }

    user.imageURL = url;
    await user.save();

    res.status(200).json({ message: "profile pic added successfully", url });
  } catch (error) {
    console.log(error);
  }
}

async function getProfilePic(req: CustomRequest, res: Response) {
  try {
    const id = req.user?.id;
    if (!id) {
      res.status(400).json({ error: "no user found" });
      return;
    }
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ error: "no user found " });
      return;
    }
    let profileURL = user?.imageURL;
    res.status(200).json({ profileURL });
    return;
  } catch (error) {
    res.status(500).json(error);
    return;
  }
}

export {
  postUser,
  postLogin,
  findFrinds,
  sendfriendRequset,
  getFrendRequset,
  manageFriendRequest,
  listFriends,
  addProfilePic,
  getProfilePic,
};
