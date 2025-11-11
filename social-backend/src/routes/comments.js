// src/routes/comments.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { Comment, Post, User } = require('../models');

// add comment
router.post('/:postId', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (!content || content.trim() === '') return res.status(400).json({ msg: 'Content required' });
    const comment = await Comment.create({ userId: req.user.id, postId: post.id, content });
    const full = await Comment.findByPk(comment.id, { include: [{ model: User, attributes: ['id','name','avatar'] }] });
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { postId: req.params.postId },
      order: [['createdAt', 'ASC']],
      include: [{ model: User, attributes: ['id','name','avatar'] }]
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// delete comment - owner only
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Not found' });
    if (comment.userId !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });
    await comment.destroy();
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
