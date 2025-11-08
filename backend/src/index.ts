import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { socketHandler } from './sockets/socketHandler';

dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express(); // ✅ full express app
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();
app.get('/', (req, res) => {
  res.send('Backend is running!');
});


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO handling
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});