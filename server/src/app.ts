import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import router from "./Routes/Routes";
import { createServer } from "http";
import { Server } from "socket.io";

const app: Application = express();
const server = createServer(app);

// Configure CORS for the client running at http://localhost:5173
const corsOption = {
  origin: "http://localhost:5173",
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
  console.log("a user is connected");

  //register the current user to the server
  socket.on("register", (userId) => {
    connectedUser.set(userId, socket.id);
  });

  socket.on("private_message", ({ message, recipientID, senderID }) => {
    console.log("message: ", message);
    console.log("reipientID: ", recipientID);
    console.log("senderID: ", senderID);

    const recipientSocketID = connectedUser.get(recipientID);
    if (recipientSocketID) {
      io.to(recipientSocketID).emit("private_message", { message, senderID });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(express.json());
app.use("/", router);

export { app, server };
