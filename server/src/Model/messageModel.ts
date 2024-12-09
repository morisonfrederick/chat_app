import mongoose, { Document, Schema } from "mongoose";

import Imessage from "../interfaces/message.interface";

type ImessageMOdel = Imessage & Document;

const messageSchema = new Schema({
  senderID: {
    type: String,
    required: true,
  },
  recipientID: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    trim: true,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model<ImessageMOdel>("Message", messageSchema);

export default Message;
