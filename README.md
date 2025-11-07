# Real-Time Chat Application

This is a real-time chat application built with Node.js, Express, MongoDB, Socket.IO, React, and Tailwind CSS.

## Features

- User authentication (register/login)
- Real-time messaging
- Chat history saved in MongoDB
- Total chat counts and total users

## Project Structure

- `backend`: Node.js/Express server with Socket.IO
- `frontend`: React application with Vite

## Setup Instructions

### Backend

1. Navigate to the `backend` directory.
2. Copy `.env.example` to `.env` and update the variables.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.

### Frontend

1. Navigate to the `frontend` directory.
2. Copy `.env.example` to `.env` and update the variables.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.

## Environment Variables

### Backend

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `FRONTEND_URL`: URL of the frontend application (for CORS)
- `PORT`: Port for the backend server (default: 5000)

### Frontend

- `VITE_BACKEND_URL`: URL of the backend server (default: http://localhost:5000)