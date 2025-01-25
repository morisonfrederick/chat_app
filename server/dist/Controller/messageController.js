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
const messageModel_1 = __importDefault(require("../Model/messageModel"));
function retrieveMsg(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { senderID, recipientID } = req.body.data;
            console.log(req.body);
            console.log("req,body ", senderID, recipientID);
            if (!senderID || !recipientID) {
                res.status(400).json({ message: "id is missing" });
                return;
            }
            const msg = yield messageModel_1.default.find({
                $or: [
                    { senderID, recipientID },
                    { senderID: recipientID, recipientID: senderID },
                ],
            });
            if (!msg) {
                res.status(204).json({ message: "new chat" });
                return;
            }
            console.log("stored msg: ", msg);
            res.status(200).json({ message: msg });
            return;
        }
        catch (error) { }
    });
}
exports.default = retrieveMsg;
