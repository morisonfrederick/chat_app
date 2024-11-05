import { server } from "./app";
import { connectDb } from "./config/db";

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`app running on:${PORT}`);
  } catch (err) {
    console.log(err);
  }
});
