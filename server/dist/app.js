"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Routes_1 = __importDefault(require("./Routes/Routes"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
// Configure CORS for the client running at https://social-media-app-3y61.onrender.com
const corsOption = {
    origin: "https://social-media-app-3y61.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOption));
const io = new socket_io_1.Server(server, {
    cors: corsOption,
});
//store connected user and their socket id
const connectedUser = new Map();
io.on("connection", (socket) => {
    //register the current user to the server
    socket.on("register", (userId) => {
        connectedUser.set(userId, socket.id);
    });
    socket.on("private_message", ({ message, recipientID, senderID }) => {
        const recipientSocketID = connectedUser.get(recipientID);
        if (recipientSocketID) {
            io.to(recipientSocketID).emit("private_message", { message, senderID });
        }
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
app.use(express_1.default.json());
app.use("/", Routes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "public/uploads")));
