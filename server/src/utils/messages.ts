import Imessage from "../interfaces/message.interface";
import Message from "../Model/messageModel";
async function saveMessages(params: Imessage) {
  console.log("params: ", params);
  if (!params.senderID || !params.recipientID) {
    console.log("some id is missing");
    return;
  }

  let msg = new Message({
    senderID: params.senderID,
    recipientID: params.recipientID,
    message: params.message,
  });
  await msg.save();
  console.log("new msg : ", msg);
}

export default saveMessages;
