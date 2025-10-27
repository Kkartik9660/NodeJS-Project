import { getRedis } from "../config/redis.js";
export async function sendPrivate(toUserId, event, payload) {
  const redis = getRedis();
  const socketId = await redis.get(`socket:user:${toUserId}`);
  if (!socketId) return false;
  // We cannot access io directly here without storing; recommended: export io from sockets/index.js if needed.
  return socketId;
}
