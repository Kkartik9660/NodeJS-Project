import express from "express";
import * as postCtrl from "../controllers/post.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", authenticate, upload.single("image"), postCtrl.createPost);
router.get("/", postCtrl.listPosts);
router.get("/:id", postCtrl.getPostById);
router.put("/:id", authenticate, upload.single("image"), postCtrl.updatePost);
router.delete("/:id", authenticate, postCtrl.deletePost);

export default router;
