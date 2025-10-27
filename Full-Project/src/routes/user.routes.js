import express from "express";
import { authenticate } from "../middlewares/auth.js";
import * as userCtrl from "../controllers/user.controller.js";
const router = express.Router();

router.get("/profile", authenticate, userCtrl.getProfile);

export default router;
