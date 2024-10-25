import express, { Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import router from "./Routes/Routes";
import {createServer} from 'http';
import { Server } from 'socket.io';
import { log } from "console";
dotenv.config();

const app: Application = express();
const server = createServer(app);

// Configure CORS for the client running at http://localhost:5173
const corsOption ={
  origin: 'http://localhost:5173',
  methods: ["GET", "POST"], 
  credentials: true
}

app.use(cors(corsOption));

const io = new Server(server,{
  cors:corsOption
});

io.on('connection', (socket) => {
  console.log('a user is connected');
  
  socket.on('message', (msg) => {
    console.log('msg received', msg);
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(express.json());
app.use('/', router);

export { app, server };
