import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface Message {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
}


const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [user, setUser] = useState({ _id: '', name: '' });
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, you would get the user from authentication context or localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // For demo, we'll create a random user
      const randomUser = {
        _id: Math.random().toString(36).substr(2, 9),
        name: 'User' + Math.floor(Math.random() * 1000),
      };
      setUser(randomUser);
      localStorage.setItem('user', JSON.stringify(randomUser));
    }

    // Connect to Socket.IO server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for incoming messages
    newSocket.on('chat message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user join events
    newSocket.on('user join', (username: string) => {
      // You can handle user join notifications if needed
      console.log(`${username} joined`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && socket) {
      socket.emit('chat message', {
        userId: user._id,
        message: messageInput,
        room: 'general',
      });
      setMessageInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <strong>{msg.user.name}: </strong>
            {msg.message}
            <span className="text-gray-500 text-sm ml-2">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;