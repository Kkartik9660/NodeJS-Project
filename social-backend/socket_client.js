// socket_client.js
// Usage: set environment variables BASE_URL and TOKEN, then `node socket_client.js`
// Example: BASE_URL=http://localhost:4000 TOKEN=<your_jwt> node socket_client.js
const { io } = require("socket.io-client");

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
const TOKEN = process.env.TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5MDczMzk4LCJleHAiOjE3NTk2NzgxOTh9.u9HPVQc8l0L1EFt1un8BDwGPjOx-7IyqpmooAWYRLdM";

const socket = io(BASE_URL, {
  auth: { token: TOKEN },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("connected:", socket.id);
  // send a test private message after connect (change `to`)
  setTimeout(() => {
    socket.emit("private_message", { to: 2, content: "Hello from socket_client.js" });
  }, 1000);
});

socket.on("online_users", (list) => {
  console.log("online_users:", list);
});

socket.on("new_message", (m) => {
  console.log("new_message:", m);
});

socket.on("message_sent", (m) => {
  console.log("message_sent:", m);
});

socket.on("disconnect", () => {
  console.log("disconnected");
});

socket.on("connect_error", (err) => {
  console.error("connect_error:", err.message);
});
