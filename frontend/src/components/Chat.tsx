import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/useAuth';
import axios from 'axios';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  message: string;
  timestamp: string;
}

interface SystemMessage {
  user: string;
  message: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<(Message | SystemMessage)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    });

    setSocket(newSocket);

    // Load chat history and stats
    loadChatHistory();
    loadStats();

    // Socket event listeners
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_join', (data: SystemMessage) => {
      setMessages(prev => [...prev, data]);
      setOnlineUsers(prev => prev + 1);
    });

    newSocket.on('user_leave', (data: SystemMessage) => {
      setMessages(prev => [...prev, data]);
      setOnlineUsers(prev => Math.max(0, prev - 1));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/stats`);
      setTotalChats(response.data.totalChats);
      setTotalUsers(response.data.totalUsers);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send_message', {
        message: newMessage,
        room: 'general'
      });
      setNewMessage('');
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
          <div className="mt-2 text-sm text-gray-600">
            Welcome, {user?.name}
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
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
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                'sender' in msg && msg.sender._id === user?.id
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'sender' in msg
                  ? 'bg-white border border-gray-200'
                  : 'bg-yellow-100 border border-yellow-200 text-center'
              }`}
            >
              {'sender' in msg ? (
                <>
                  <div className="font-semibold text-sm">
                    {msg.sender._id === user?.id ? 'You' : msg.sender.name}
                  </div>
                  <div className="mt-1">{msg.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium">{msg.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
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