import { Server, Socket } from 'socket.io';
import Chat from '../models/Chat';

export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join a room (optional, for multiple rooms)
    socket.on('join room', (room) => {
      socket.join(room);
    });

    // Listen for chat message from frontend ('send_message')
    socket.on('send_message', async (data) => {
      try {
        // Save message to database
        const chat = new Chat({
          user: data.userId, // make sure frontend sends this
          message: data.message,
          room: data.room || 'general',
        });
        await chat.save();

        // Populate user field
        await chat.populate('user', 'name');

        // Emit the message back to all clients in room as 'new_message'
        io.to(data.room || 'general').emit('new_message', {
          _id: chat._id,
          user: chat.user,
          message: chat.message,
          room: chat.room,
          createdAt: chat.createdAt?.toISOString(),
        });
      } catch (error) {
        console.error(error);
      }
    });

    // Listen for user join event
    socket.on('user join', (username) => {
      socket.broadcast.emit('user_join', {
        user: username,
        message: `${username} joined the chat`,
        timestamp: new Date(),
      });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Optional: broadcast user leave
      socket.broadcast.emit('user_leave', {
        user: 'Someone',
        message: `A user left the chat`,
        timestamp: new Date(),
      });
    });
  });
};
