import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { initDb } from "./src/config/db.js";
import { initRedis } from "./src/config/redis.js";
import routes from "./src/routes/index.js";
import { initSockets } from "./src/sockets/index.js";
import cronJobs from "./src/jobs/cron.jobs.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")));

// routes
app.use("/api", routes);

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await initDb();
    await initRedis();
    // start sockets
    initSockets(server);
    // start cron jobs
    cronJobs();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
