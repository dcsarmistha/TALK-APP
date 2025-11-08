# 💬 Real-Time Chat App

A full-stack **real-time chat application** built with **React, TypeScript, Node.js, Express, MongoDB, and Socket.IO**, featuring authentication, live messaging, and persistent chat history.

---

## 🚀 Features

- 🔐 **User Authentication**
  - Signup & Login with JWT-based authentication
  - Secure password hashing using bcrypt
- 💬 **Real-Time Messaging**
  - Built with Socket.IO for instant chat updates
  - System messages for user join/leave events
- 🧾 **Chat History**
  - All messages are stored and fetched from MongoDB
- 👥 **Live User Stats**
  - Shows online users, total chats, and total registered users
- 🎨 **Responsive UI**
  - Built with React + Tailwind CSS
  - User-friendly and mobile-compatible design

---

## 🏗️ Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- Axios (API calls)
- Socket.IO client

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO server
- JWT Authentication
- bcrypt password encryption

---

## ⚙️ Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dcsarmistha/TALK-APP.git
cd chat-app
2. Setup the Backend
bash
Copy code
cd backend
npm install
Create a .env file:
#.env for backend
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Run the backend server:
bash
Copy code
npm run dev
The backend will start on http://localhost:5000

3. Setup the Frontend
bash
Copy code
cd frontend
npm install
Create a .env file:
#.env for backend
Copy code
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
Run the frontend app:
bash
Copy code
npm run dev
The frontend will start on http://localhost:5173

🗄️ Folder Structure
Copy code
chat-app/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
         ── middleware/
│   │   ├── socket/
│   │   └── server.ts
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── index.css
    │   └── App.tsx
        └── main.tsx
    ├── .env
    └── package.json
🧩 API Endpoints
Method	Endpoint	Description
POST	/api/users/signup	Register a new user
POST	/api/users/login	Authenticate a user
GET	/api/chat/history	Fetch all chat messages
GET	/api/chat/count	Get total chat messages
GET	/api/chat/users/count	Get total registered users

💾 MongoDB Collections
users

_id, name, email, password (hashed), createdAt

chats

_id, user, message, room, createdAt

🔌 Socket.IO Events
Event	Direction	Description
chat message	client → server	Send a message
new_message	server → client	Broadcasts new chat messages
user join	server → client	Notifies when a user joins
user leave	server → client	Notifies when a user disconnects

🌍 Deployment
You can deploy this easily without Docker:

Frontend:
Deploy frontend/dist to Vercel, Netlify, or Cloudflare Pages

Backend:
Deploy Node.js server to Render, Railway, or Fly.io




🏁 Conclusion
This project demonstrates real-time communication, JWT-based authentication, and MERN stack integration with modern UI practices.








