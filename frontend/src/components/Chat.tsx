import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/useAuth';
import axios from 'axios';

interface Message {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  message: string;
  room: string;
  createdAt: string;
}

interface SystemMessage {
  message: string;
  timestamp: string;
}

type ChatMessage = Message | SystemMessage;

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });

    setSocket(newSocket);

    // Join the general room immediately
    newSocket.emit('join room', 'general');

    loadChatHistory();
    loadStats();

    newSocket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('user join', (msg: SystemMessage) => {
      setMessages(prev => [...prev, msg]);
      setOnlineUsers(prev => prev + 1);
    });

    newSocket.on('user leave', (msg: SystemMessage) => {
      setMessages(prev => [...prev, msg]);
      setOnlineUsers(prev => Math.max(0, prev - 1));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/history`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const chatRes = await axios.get(`${import.meta.env.VITE_API_URL}/chat/count`);
      setTotalChats(chatRes.data.totalChats);

      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/chat/users/count`);
      setTotalUsers(userRes.data.totalUsers);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user?.id) {
      const messageData = {
        userId: user.id,
        message: newMessage,
        room: 'general',
      };

      // Emit to server
      socket.emit('chat message', messageData);

      // Add message immediately to UI for sender
      setMessages(prev => [
        ...prev,
        {
          _id: Date.now().toString(), // temporary id
          user: { _id: user.id, name: user.name },
          message: newMessage,
          room: 'general',
          createdAt: new Date().toISOString(),
        },
      ]);

      setNewMessage('');
    }
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    logout();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5 hidden md:block rounded-tr-3xl rounded-br-3xl">
        <h1 className="text-2xl font-bold text-purple-600">ChatApp 💬</h1>
        <div className="mt-4 flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-gray-700 font-medium">{user?.name} (Online)</span>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-600 mb-2">Stats</h2>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li>🟢 Online Users: {onlineUsers}</li>
            <li>💬 Total Chats: {totalChats}</li>
            <li>👥 Total Users: {totalUsers}</li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUserMessage = 'user' in msg && msg.user?._id === user?.id;
            const isOtherUserMessage = 'user' in msg && msg.user?._id !== user?.id;

            return (
              <div key={idx} className="flex flex-col">
                {'user' in msg ? (
                  <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isUserMessage && (
                      <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center text-white font-bold mr-2">
                        {msg.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow ${
                        isUserMessage
                          ? 'bg-purple-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {!isUserMessage && (
                        <div className="font-semibold text-sm">{msg.user.name}</div>
                      )}
                      <div>{msg.message}</div>
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {formatTime(msg.createdAt || msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 italic text-sm">
                    {msg.message} - {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white flex items-center space-x-4 sticky bottom-0 shadow-md">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
