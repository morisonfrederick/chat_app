import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import router from "./Routes/Routes";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import saveMessages from "./utils/messages";
import { set } from "mongoose";
const ORIGIN = process.env.ORIGIN;

const app: Application = express();
const server = createServer(app);

// Configure CORS for the client running at https://social-media-app-3y61.onrender.com
const corsOption = {
  origin: ORIGIN,
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOption));

const io = new Server(server, {
  cors: corsOption,
});

//store connected user and their socket id
const connectedUser = new Map();

io.on("connection", (socket) => {
  //register the current user to the server
  socket.on("register", (userId) => {
    connectedUser.set(userId, socket.id);
    io.emit("user_online", userId);
  });

  socket.on("private_message", ({ message, recipientID, senderID }) => {
    console.log("priviate msg created");
    saveMessages({ senderID, recipientID, message });

    const recipientSocketID = connectedUser.get(recipientID);
    if (recipientSocketID) {
      io.to(recipientSocketID).emit("private_message", { message, senderID });
      console.log("calling saveMessages function");
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUsers = Array.from(connectedUser.entries()).find(
      ([_, socketID]) => {
        socketID === socket.id;
      }
    );
    if (disconnectedUsers) {
      const userId = disconnectedUsers[0];
      connectedUser.delete(userId);
      io.emit("user_offline", userId);
      console.log(`User ${userId} is disconnected`);
    }
  });
});

app.use(express.json());
app.use("/", router);
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Content-Type", "image/jpeg");
    next();
  },
  express.static(path.join(__dirname, "public/uploads"))
);

export { app, server };
