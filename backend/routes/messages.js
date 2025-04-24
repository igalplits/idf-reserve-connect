const express = require('express');
const router = express.Router();
const Message = require('../models/Message');  // Import the Message model

// Route to send a message
router.post('/send', async (req, res) => {
  const { from, to, message } = req.body;

  try {
    const newMessage = new Message({
      from,
      to,
      message,
    });

    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', details: error });
  }
});

// Fetch messages for a user and delete them after
router.post('/fetchAndDelete', async (req, res) => {
    const { userId, recipientId } = req.body;
  
    try {
      const messages = await Message.find({
        to: userId,
        from: recipientId,
      });
  
      // Delete after fetching
      await Message.deleteMany({
        to: userId,
        from: recipientId,
      });
  
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch and delete messages' });
    }
  });

module.exports = router;

