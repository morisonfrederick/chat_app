"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "access token is missing" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, (error, decoded) => {
            if (error) {
                if ((error.name = "TokenExpiredError")) {
                    res.status(401).json({ message: "Token expired" });
                    return;
                }
                res.status(403).json({ message: "Invalid token" });
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = verifyToken;
