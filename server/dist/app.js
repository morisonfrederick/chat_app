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
const messages_1 = __importDefault(require("./utils/messages"));
const ORIGIN = process.env.ORIGIN;
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
// Configure CORS for the client running at https://social-media-app-3y61.onrender.com
const corsOption = {
    origin: ORIGIN,
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
        io.emit("user_online", userId);
    });
    socket.on("private_message", ({ message, recipientID, senderID }) => {
        console.log("priviate msg created");
        (0, messages_1.default)({ senderID, recipientID, message });
        const recipientSocketID = connectedUser.get(recipientID);
        if (recipientSocketID) {
            io.to(recipientSocketID).emit("private_message", { message, senderID });
            console.log("calling saveMessages function");
        }
    });
    socket.on("disconnect", () => {
        const disconnectedUsers = Array.from(connectedUser.entries()).find(([_, socketID]) => {
            socketID === socket.id;
        });
        if (disconnectedUsers) {
            const userId = disconnectedUsers[0];
            connectedUser.delete(userId);
            io.emit("user_offline", userId);
            console.log(`User ${userId} is disconnected`);
        }
    });
});
app.use(express_1.default.json());
app.use("/", Routes_1.default);
app.use("/uploads", (req, res, next) => {
    res.setHeader("Content-Type", "image/jpeg");
    next();
}, express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
