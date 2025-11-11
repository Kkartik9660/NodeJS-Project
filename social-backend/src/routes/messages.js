// src/routes/messages.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { Message, User } = require('../models');
const { Op } = require('sequelize');

// get conversation with a user
router.get('/:withUserId', authenticate, async (req, res) => {
  try {
    const otherId = parseInt(req.params.withUserId);
    if (!otherId) return res.status(400).json({ msg: 'Invalid user id' });

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: otherId },
          { senderId: otherId, receiverId: req.user.id }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
