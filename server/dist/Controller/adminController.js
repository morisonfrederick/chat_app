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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsers = deleteUsers;
const userModel_1 = require("../Model/userModel");
function deleteUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield userModel_1.User.deleteMany({}); // Deletes all documents in the 'User' collection
            res.status(200).json({ message: "All users deleted successfully", result });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to delete users", error });
        }
    });
}
