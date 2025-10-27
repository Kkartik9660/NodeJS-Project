import { getRedis } from "../config/redis.js";
import crypto from "crypto";

export async function generateAndStoreOTP(identifier) {
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const key = `otp:${identifier}`;
  const ttl = Number(process.env.OTP_EXPIRES || 300);
  const redis = getRedis();
  await redis.set(key, otp, { EX: ttl });
  return otp;
}

export async function verifyOTP(identifier, otp) {
  const redis = getRedis();
  const key = `otp:${identifier}`;
  const stored = await redis.get(key);
  if (!stored) return false;
  if (stored !== otp) return false;
  await redis.del(key);
  return true;
}
