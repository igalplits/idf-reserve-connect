// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// require('dotenv').config();

// const postRoutes = require('./routes/posts');
// const usersRoutes = require('./routes/auth');
// const commentsRoutes = require('./routes/comments');
// const messageRoutes = require('./routes/messages');
// const Message = require('./models/Message'); // You'll need to create this model

// console.log("Starting server...");

// const app = express();
// const server = http.createServer(app); // Create HTTP server for Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });

// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log("MongoDB connected successfully");
//     const db = mongoose.connection;
//     console.log("Using database:", db.name);
//   })
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Routes
// app.get('/', (req, res) => res.send("API is running"));
// app.use('/api/auth', usersRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/comments', commentsRoutes);
// // Message route
// app.use('/api/messages', messageRoutes); // Add message routes

// // In-memory map of connected users: userId -> socketId
// const connectedUsers = {};

// // When the recipient opens the chat or views the message
// const markMessageAsRead = async (messageId) => {
//   await Message.findByIdAndUpdate(messageId, { status: 'read' });
// };


// // Socket.IO chat logic
// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // When user logs in and registers their socket
//   socket.on('register', (userId) => {
//     connectedUsers[userId] = socket.id;
//     console.log(`Registered user ${userId} with socket ${socket.id}`);
//   });

//   socket.on('sendMessage', async ({ from, to, message }) => {
//     const newMessage = new Message({
//       from,
//       to,
//       message,
//       timestamp: new Date(), // Timestamp for when the message is sent
//       status: 'sent' // Initially set as 'sent'
//     });
  
//     await newMessage.save();
  
//     const msgData = {
//       _id: newMessage._id,
//       from,
//       to,
//       message,
//       timestamp: newMessage.timestamp,
//       status: newMessage.status,
//     };
  
//     // Emit to recipient to notify them about the new message
//     const recipientSocketId = connectedUsers[to];
//     if (recipientSocketId) {
//       io.to(recipientSocketId).emit('receiveMessage', msgData);
//     }
//   });

//   socket.on('receiveMessage', async ({ from, to, message, _id }) => {
//     // Find the message by _id and update its status to 'delivered'
//     await Message.findByIdAndUpdate(_id, { status: 'delivered' });
  
//     // Emit the message to the recipient (client)
//     const recipientSocketId = connectedUsers[to];
//     if (recipientSocketId) {
//       io.to(recipientSocketId).emit('receiveMessage', {
//         from,
//         to,
//         message,
//         _id,
//         timestamp: new Date(),
//         status: 'delivered', // Mark it as delivered
//       });
//     }
//   });
  
  
  

//   // When user disconnects
//   socket.on('disconnect', () => {
//     for (let userId in connectedUsers) {
//       if (connectedUsers[userId] === socket.id) {
//         delete connectedUsers[userId];
//         console.log(`User ${userId} disconnected`);
//         break;
//       }
//     }
//   });
// });

// // Start server
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });






// index.js  (or server.js – entry point)
require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const http      = require('http');
const { Server } = require('socket.io');

/* ───────── IMPORT ROUTES & MODELS ───────── */
const postRoutes     = require('./routes/posts');
const usersRoutes    = require('./routes/auth');
const commentsRoutes = require('./routes/comments');
const messageRoutes  = require('./routes/messages');
const Message        = require('./models/Message');   // the schema from /models/Message.js

/* ───────── APP & SERVER ───────── */
console.log('Starting server…');
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 5000;

/* ───────── MIDDLEWARE ───────── */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ───────── DATABASE ───────── */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    const db = mongoose.connection;
    console.log(`✓ MongoDB connected – using DB: ${db.name}`);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

/* ───────── ROUTES ───────── */
app.get('/', (_req, res) => res.send('API is running'));
app.use('/api/auth',     usersRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/messages', messageRoutes);   // REST fallback / fetch-and-delete

/* ───────── SOCKET.IO CHAT LOGIC ───────── */
const onlineUsers = new Map();   // userId ➜ socket.id

io.on('connection', (socket) => {
  console.log(`🔌  User connected: ${socket.id}`);

  /* ⿡  REGISTER USER SOCKET */
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅  Registered user ${userId} with socket ${socket.id}`);
  });

  /* ⿢  SEND MESSAGE */
  socket.on('sendMessage', async (data) => {
    // data = { from, to, message, timestamp, status }
    try {
      const saved = await Message.create(data);

      /* If recipient is online, push the message immediately and mark delivered */
      const recSock = onlineUsers.get(data.to);
      if (recSock) {
        io.to(recSock).emit('receiveMessage', {
          ...saved.toObject(),
          status: 'delivered',
        });
        saved.status = 'delivered';
        await saved.save();
      }

      /* Echo status back to the sender */
      socket.emit('messageStatusUpdate', { _id: saved._id, status: saved.status });
    } catch (err) {
      console.error('❌  sendMessage error:', err.message);
    }
  });

  /* ⿣  MARK AS READ */
  socket.on('markAsRead', async ({ messageId }) => {
    try {
      const msg = await Message.findByIdAndUpdate(
        messageId,
        { status: 'read' },
        { new: true }
      );
      if (!msg) return;

      /* Notify original sender, if online */
      const senderSock = onlineUsers.get(msg.from.toString());
      if (senderSock) io.to(senderSock).emit('messageRead', { messageId });
    } catch (err) {
      console.error('❌  markAsRead error:', err.message);
    }
  });

  /* ⿤  DISCONNECT */
  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        console.log(`🔌  User ${uid} disconnected`);
        break;
      }
    }
  });
});

/* ───────── LAUNCH ───────── */
server.listen(PORT, () => console.log(`🚀  Server running on port ${PORT})`));
