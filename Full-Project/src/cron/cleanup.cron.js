// src/cron/scheduler.js
import cron from "node-cron";
import redis from "../config/redisClient.js"; // optional use
import { User, Post } from "../models/index.js";

export function startCronJobs() {
  // Example: daily summary at 00:00 server time
  cron.schedule("0 0 * * *", async () => {
    try {
      const usersCount = await User.count();
      const postsCount = await Post.count();
      console.log(
        `[CRON] Daily summary - users: ${usersCount}, posts: ${postsCount}`
      );
      // You can call mail service or push to analytics etc.
    } catch (err) {
      console.error("[CRON] error:", err);
    }
  });

  // Example: every 5 minutes cleanup expired redis keys or send heartbeat
  cron.schedule("*/5 * * * *", async () => {
    try {
      // placeholder: you might check for stale data, send metrics, etc.
      console.log("[CRON] 5-minute job running");
    } catch (err) {
      console.error("[CRON] 5-min job error:", err);
    }
  });

  console.log("Cron jobs scheduled");
}
