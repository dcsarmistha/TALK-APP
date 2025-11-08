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

    loadChatHistory();
    loadStats();

    newSocket.on('chat message', (msg: Message) => {
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
      socket.emit('chat message', {
        userId: user.id,
        message: newMessage,
        room: 'general',
      });
      setNewMessage('');
    }
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg hidden sm:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
          <div className="mt-2 text-sm text-gray-600">Welcome, {user?.name}</div>
        </div>

        <div className="p-4">
          <h2 className="font-semibold text-gray-700 mb-2">Statistics</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Online Users:</span>
              <span className="font-medium">{onlineUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Chats:</span>
              <span className="font-medium">{totalChats}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{totalUsers}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-4"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isUserMessage = 'user' in msg && msg.user?._id === user?.id;
            const isOtherUserMessage = 'user' in msg && msg.user?._id !== user?.id;
            

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg max-w-xs lg:max-w-md wrap-break-word ${
                  isUserMessage
                    ? 'bg-blue-500 text-white ml-auto text-right'
                    : isOtherUserMessage
                    ? 'bg-white border border-gray-200'
                    : 'bg-yellow-100 border border-yellow-200 text-center italic text-gray-700'
                }`}
              >
                {'user' in msg ? (
                  <>
                    <div className="font-semibold text-sm">
                      {msg.user._id === user?.id ? 'You' : msg.user.name}
                    </div>
                    <div className="mt-1">{msg.message}</div>
                    <div className="text-xs opacity-75 mt-1">{formatTime(msg.createdAt)}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium">{msg.message}</div>
                    <div className="text-xs opacity-75 mt-1">{formatTime(msg.timestamp)}</div>
                  </>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-white p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
