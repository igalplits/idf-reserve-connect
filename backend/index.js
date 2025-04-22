const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const postRoutes = require('./routes/posts');
const usersRoutes = require('./routes/auth');
const commentsRoutes = require('./routes/comments');

console.log("Starting server...");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");

    const db = mongoose.connection;
    console.log("Using database:", db.name);
  })
  .catch((err) => console.error("MongoDB connection error:", err));


// Simple test route
app.get('/', (req, res) => res.send("API is running"));

// Auth route
app.use('/api/auth', usersRoutes);

// Posts route
app.use('/api/posts', postRoutes);

//Comments route
app.use('/api/comments', commentsRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
