import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

let redisClient;

export async function initRedis() {
  try {
    const redisUrl =
      process.env.REDIS_URL ||
      `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

    redisClient = createClient({ url: redisUrl });

    redisClient.on("connect", () => {
      console.log("✅ Redis Cloud connected successfully!");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err.message);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Failed to connect Redis:", error);
    throw error;
  }
}

export function getRedis() {
  if (!redisClient) throw new Error("Redis not initialized");
  return redisClient;
}
