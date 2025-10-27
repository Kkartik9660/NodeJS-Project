import { Server } from "socket.io";
import { getRedis } from "../config/redis.js";

let io;
export function initSockets(server) {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("auth", async ({ token }) => {
      // here you would verify token and map userId->socketId
      try {
        const jwt = await import("jsonwebtoken");
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const redis = getRedis();
        await redis.set(`socket:user:${payload.id}`, socket.id, { EX: 60 * 60 * 24 }); // 1 day
        socket.data.userId = payload.id;
        console.log("Socket authenticated for", payload.id);
      } catch (err) {
        console.warn("Socket auth failed", err.message);
      }
    });

    socket.on("private_message", async ({ toUserId, message }) => {
      const redis = getRedis();
      const toSocket = await redis.get(`socket:user:${toUserId}`);
      const fromId = socket.data.userId;
      const payload = { from: fromId, to: toUserId, message, ts: Date.now() };
      if (toSocket) {
        io.to(toSocket).emit("incoming_message", payload);
      } else {
        // store offline message in DB or Redis list (omitted)
      }
    });

    socket.on("disconnect", async () => {
      try {
        const redis = getRedis();
        if (socket.data.userId) {
          await redis.del(`socket:user:${socket.data.userId}`);
        }
        console.log("Socket disconnected", socket.id);
      } catch (err) {
        console.error(err);
      }
    });
  });

  console.log("Socket.IO initialized");
}
