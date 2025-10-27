import * as authService from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { generateAndStoreOTP, verifyOTP } from "../utils/otp.js";
// import { User } from "../models/user.model.js"; // adjust path if needed

export async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const user = await authService.register(value);
    // optionally send OTP
    res.status(201).json({ message: "Registered", user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const data = await authService.login(value);
    res.json({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: { id: data.user.id, email: data.user.email, name: data.user.name } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });
    await authService.logout({ refreshToken });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });
    const data = await authService.refresh({ refreshToken });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function sendOtp(req, res, next) {
  try {
    const { identifier } = req.body; // phone or email
    if (!identifier) return res.status(400).json({ message: "identifier required" });
    const otp = await generateAndStoreOTP(identifier);
    // send OTP by SMS/email - omitted (use mail service or SMS provider)
    console.log("OTP for", identifier, otp);
    res.json({ message: "OTP sent (dev)", otp }); // in prod don't return otp
  } catch (err) {
    next(err);
  }
}

export async function verifyOtpController(req, res, next) {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) return res.status(400).json({ message: "identifier + otp required" });
    const ok = await verifyOTP(identifier, otp);
    if (!ok) return res.status(400).json({ message: "Invalid or expired OTP" });
    res.json({ message: "OTP verified" });
  } catch (err) {
    next(err);
  }
}
