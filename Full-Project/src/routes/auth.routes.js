import express from "express";
import * as authCtrl from "../controllers/auth.controller.js"; // single import

const router = express.Router();

// Auth routes
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);
router.post("/refresh", authCtrl.refreshToken);
router.post("/send-otp", authCtrl.sendOtp);
router.post("/verify-otp", authCtrl.verifyOtpController);

export default router;
