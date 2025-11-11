// src/app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // added for password hashing
const { sequelize, User, Message } = require('./models');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const messageRoutes = require('./routes/messages');
const { verifySocketToken } = require('./middlewares/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);

// default
app.get('/', (req, res) => res.json({ ok: true, msg: 'Social backend running' }));

const server = http.createServer(app);

// Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// in-memory map userId => socketId
const onlineUsers = new Map();

io.use(async (socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: token required'));
  try {
    const payload = await verifySocketToken(token); // returns { id }
    socket.userId = payload.id;
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);
  console.log(`User connected: ${userId}, socket: ${socket.id}`);
  io.emit('online_users', Array.from(onlineUsers.keys()));

  socket.on('private_message', async ({ to, content }) => {
    try {
      // save message
      const message = await Message.create({
        senderId: userId,
        receiverId: to,
        content
      });

      const payload = {
        id: message.id,
        senderId: userId,
        receiverId: to,
        content,
        createdAt: message.createdAt
      };

      // send to receiver if online
      const receiverSocketId = onlineUsers.get(String(to));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', payload);
      }

      // ack to sender as well
      socket.emit('message_sent', payload);
    } catch (err) {
      console.error('private_message error', err);
      socket.emit('error', { msg: 'Could not send message' });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`User disconnected: ${userId}`);
  });
});

// start
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // sync models (use migrations for production)
    await sequelize.sync({ alter: true });

    // ✅ Create test user 2 if not exists (avoid foreign key error)
    const user2 = await User.findByPk(2);
    if (!user2) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        id: 2,
        name: 'User2',
        email: 'user2@example.com',
        password: hashedPassword
      });
      console.log('Test user 2 created');
    }

    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
