export default interface Imessage {
  senderID: string;
  recipientID: string;
  message: string;
  timestamp?: Date;
}
