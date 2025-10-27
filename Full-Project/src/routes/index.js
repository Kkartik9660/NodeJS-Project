import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/posts", postRoutes);

router.get("/", (req, res) => res.json({ message: "API root" }));

export default router;
