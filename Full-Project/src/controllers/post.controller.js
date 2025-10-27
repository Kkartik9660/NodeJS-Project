import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import fs from "fs";
import path from "path";
import { firebaseDb } from "../config/firebase.admin.js"; // ✅ Import Firebase DB

let models;
async function getModels() {
  if (!models) models = initModels(sequelize);
  return models;
}

// ----------------------
// 🟢 CREATE POST
// ----------------------
export async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;
    const file = req.file;
    const { Post } = await getModels();

    const post = await Post.create({
      title,
      content,
      image: file ? `/uploads/${file.filename}` : null,
      userId: req.user.id,
    });

    // ✅ Sync to Firebase
    await firebaseDb.ref(`posts/${post.id}`).set({
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      userId: post.userId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    next(err);
  }
}

// ----------------------
// 🟡 LIST POSTS
// ----------------------
export async function listPosts(req, res, next) {
  try {
    const { Post, User } = await getModels();
    const posts = await Post.findAll({
      include: [{ model: User, attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
}

// ----------------------
// 🔵 GET POST BY ID
// ----------------------
export async function getPostById(req, res, next) {
  try {
    const { Post } = await getModels();
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
}

// ----------------------
// 🟣 UPDATE POST
// ----------------------
export async function updatePost(req, res, next) {
  try {
    const { Post } = await getModels();
    const post = await Post.findByPk(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const { title, content } = req.body;

    if (req.file) {
      // Remove old image if exists
      if (post.image) {
        const p = post.image.startsWith("/") ? post.image.slice(1) : post.image;
        fs.unlink(path.join(process.cwd(), p), (err) => {});
      }
      post.image = `/uploads/${req.file.filename}`;
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    await post.save();

    // ✅ Update Firebase
    await firebaseDb.ref(`posts/${post.id}`).update({
      title: post.title,
      content: post.content,
      image: post.image,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
}

// ----------------------
// 🔴 DELETE POST
// ----------------------
export async function deletePost(req, res, next) {
  try {
    const { Post } = await getModels();
    const post = await Post.findByPk(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    // Remove image locally
    if (post.image) {
      const p = post.image.startsWith("/") ? post.image.slice(1) : post.image;
      fs.unlink(path.join(process.cwd(), p), (err) => {});
    }

    await post.destroy();

    // ✅ Delete from Firebase
    await firebaseDb.ref(`posts/${post.id}`).remove();

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// import { sequelize } from "../config/db.js";
// import { initModels } from "../models/index.js";
// import fs from "fs";
// import path from "path";

// let models;
// async function getModels() {
//   if (!models) models = initModels(sequelize);
//   return models;
// }

// export async function createPost(req, res, next) {
//   try {
//     const { title, content } = req.body;
//     const file = req.file;
//     const { Post } = await getModels();
//     const post = await Post.create({
//       title,
//       content,
//       image: file ? `/uploads/${file.filename}` : null,
//       userId: req.user.id
//     });
//     res.status(201).json({ post });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function listPosts(req, res, next) {
//   try {
//     const { Post, User } = await getModels();
//     const posts = await Post.findAll({ include: [{ model: User, attributes: ["id","name","email"] }], order: [["createdAt", "DESC"]] });
//     res.json({ posts });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function getPostById(req, res, next) {
//   try {
//     const { Post } = await getModels();
//     const post = await Post.findByPk(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post not found" });
//     res.json({ post });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function updatePost(req, res, next) {
//   try {
//     const { Post } = await getModels();
//     const post = await Post.findByPk(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post not found" });
//     if (post.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

//     const { title, content } = req.body;
//     if (req.file) {
//       // remove old image if exists
//       if (post.image) {
//         const p = post.image.startsWith("/") ? post.image.slice(1) : post.image;
//         fs.unlink(path.join(process.cwd(), p), err => {});
//       }
//       post.image = `/uploads/${req.file.filename}`;
//     }
//     post.title = title ?? post.title;
//     post.content = content ?? post.content;
//     await post.save();
//     res.json({ post });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function deletePost(req, res, next) {
//   try {
//     const { Post } = await getModels();
//     const post = await Post.findByPk(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post not found" });
//     if (post.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
//     await post.destroy();
//     res.json({ message: "Deleted" });
//   } catch (err) {
//     next(err);
//   }
// }
