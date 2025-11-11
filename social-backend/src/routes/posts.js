// src/routes/posts.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../utils/upload');
const { Post, User, Like, Comment, sequelize } = require('../models');
const { Op } = require('sequelize');

// create post
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ msg: 'Content required' });
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await Post.create({ userId: req.user.id, content, image });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get paginated posts (newest first)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        { model: User, attributes: ['id', 'name', 'avatar'] },
      ]
    });

    // attach counts
    const postIds = posts.map(p => p.id);
    const likesCounts = await Like.findAll({
      attributes: ['post_Id', [sequelize.fn('COUNT', sequelize.col('post_Id')), 'count']],
      where: { post_Id: { [Op.in]: postIds } },
      group: ['post_Id']
    });
    const commentsCounts = await Comment.findAll({
      attributes: ['post_Id', [sequelize.fn('COUNT', sequelize.col('post_Id')), 'count']],
      where: { post_Id: { [Op.in]: postIds } },
      group: ['post_Id']
    });

    const likesMap = {};
    likesCounts.forEach(r => likesMap[r.postId] = parseInt(r.get('count')));
    const commentsMap = {};
    commentsCounts.forEach(r => commentsMap[r.postId] = parseInt(r.get('count')));

    const result = posts.map(p => ({
      ...p.toJSON(),
      likesCount: likesMap[p.id] || 0,
      commentsCount: commentsMap[p.id] || 0
    }));

    res.json({ page, limit, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
    });
    if (!post) return res.status(404).json({ msg: 'Not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// update post (owner only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });
    post.content = req.body.content || post.content;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// delete post (owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });
    await post.destroy();
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// like/unlike (toggle)
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Not found' });

    const existing = await Like.findOne({ where: { userId: req.user.id, postId: post.id } });
    if (existing) {
      await existing.destroy();
    } else {
      await Like.create({ userId: req.user.id, postId: post.id });
    }
    const count = await Like.count({ where: { postId: post.id } });
    res.json({ liked: !existing, likesCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
