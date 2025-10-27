import http from "http";
import app from "./app.js";
import { initSocket } from "./sockets/socket.js";
import { initCronJobs } from "./utils/cronJobs.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// init socket.io
initSocket(server);

// init cron jobs
initCronJobs();

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
