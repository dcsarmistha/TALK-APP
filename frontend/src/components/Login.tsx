import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 space-y-6">
        {/* Welcome message */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold text-indigo-600 animate-pulse">
            💬 Welcome to Chat App
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {isLogin
              ? 'Sign in to join the chat and connect instantly!'
              : 'Create your account to start chatting in real time!'}
          </p>
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-800">
          {isLogin ? 'Sign in to ChatApp' : 'Create your account'}
        </h2>

        {/* Toggle */}
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <button
            className={`px-3 py-1 rounded-lg font-medium ${
              isLogin ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            } transition`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-3 py-1 rounded-lg font-medium ${
              !isLogin ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            } transition`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="text-blue-500 font-medium hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
