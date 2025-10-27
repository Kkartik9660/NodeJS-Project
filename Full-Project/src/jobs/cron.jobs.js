import cron from "node-cron";
import fs from "fs";
import path from "path";

export default function cronJobs() {
  // every day at 02:00 AM - cleanup old uploads older than 7 days
  cron.schedule("0 2 * * *", async () => {
    try {
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
      const files = fs.readdirSync(uploadDir);
      const now = Date.now();
      for (const file of files) {
        const full = path.join(uploadDir, file);
        const stat = fs.statSync(full);
        const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageDays > 7) fs.unlinkSync(full);
      }
      console.log("Cron cleanup done");
    } catch (err) {
      console.error("Cron error:", err);
    }
  });

  // optional: run every 5 minutes to prune expired socket mappings (if needed)
  cron.schedule("*/5 * * * *", async () => {
    // noop for example
  });

  console.log("Cron jobs scheduled");
}
