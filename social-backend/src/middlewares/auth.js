// src/middlewares/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({ msg: 'No token provided' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Malformed token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// used by socket auth (returns payload or throws)
const verifySocketToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
};

module.exports = { authenticate, verifySocketToken };
