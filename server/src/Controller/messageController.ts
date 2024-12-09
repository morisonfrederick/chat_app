import Message from "../Model/messageModel";
import { Request, Response } from "express";

async function retrieveMsg(req: Request, res: Response) {
  try {
    const { senderID, recipientID } = req.body.data;
    console.log(req.body);

    console.log("req,body ", senderID, recipientID);
    if (!senderID || !recipientID) {
      res.status(400).json({ message: "id is missing" });
      return;
    }

    const msg = await Message.find({
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
  } catch (error) {}
}

export default retrieveMsg;
