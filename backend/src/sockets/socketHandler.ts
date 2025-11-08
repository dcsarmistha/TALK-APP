import { Server, Socket } from 'socket.io';
import Chat from '../models/Chat';
import User from '../models/User';

export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join a room (optional, for multiple rooms)
    socket.on('join room', (room) => {
      socket.join(room);
    });

    // Listen for chat message
    socket.on('chat message', async (data) => {
      try {
        // Save message to database
        const chat = new Chat({
          user: data.userId,
          message: data.message,
          room: data.room || 'general',
        });
        await chat.save();

        // Populate the user field to get the user's name
        await chat.populate('user', 'name');

        // Emit the message to all clients in the room
        io.to(data.room || 'general').emit('chat message', {
          _id: chat._id,
          user: chat.user,
          message: chat.message,
       createdAt: chat.createdAt?.toISOString(), 
        });
      } catch (error) {
        console.error(error);
      }
    });

    // Listen for user join event (optional)
    socket.on('user join', (username) => {
      socket.broadcast.emit('user join', username);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};