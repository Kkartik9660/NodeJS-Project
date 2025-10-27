import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { firebaseDb } from "../config/firebase.admin.js";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken  } from "../utils/jwt.js";
import { Op } from "sequelize";

let models;
async function getModels() {
  if (!models) {
    models = initModels(sequelize);
  }
  return models;
}

export async function register({ name, email, password, phone }) {
  const { User } = await getModels();

  // Check if user already exists
  const existing = await User.findOne({
    where: { [Op.or]: [{ email }, { phone }] },
  });
  if (existing) throw { status: 400, message: "User already exists" };

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create user in MySQL
  const user = await User.create({ name, email, password: hashed, phone });

  // ✅ Store same user in Firebase Realtime Database
  try {
    await firebaseDb.ref(`users/${user.id}`).set({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: Date.now(),
    });
    console.log("✅ User synced to Firebase DB:", user.id);
  } catch (err) {
    console.error("❌ Firebase sync error:", err.message);
  }

  return user;
}

export async function login({ email, password }) {
  const { User, RefreshToken } = await getModels();
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 400, message: "Invalid credentials" };
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 400, message: "Invalid credentials" };

  const payload = { id: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // store refresh token in DB
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  await RefreshToken.create({ token: refreshToken, userId: user.id, expiresAt });

  return { accessToken, refreshToken, user };
}

export async function logout({ refreshToken }) {
  const { RefreshToken } = await getModels();
  await RefreshToken.destroy({ where: { token: refreshToken } });
  return true;
}

export async function refresh({ refreshToken }) {
  const { RefreshToken } = await getModels();
  const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!stored) throw { status: 401, message: "Invalid refresh token" };

  let payload;
  try {
    // use jwt.js verify function instead of importing jsonwebtoken separately
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    await RefreshToken.destroy({ where: { token: refreshToken } });
    throw { status: 401, message: "Invalid refresh token" };
  }

  // generate new access and refresh tokens
  const newAccess = signAccessToken({ id: payload.id, email: payload.email });
  const newRefresh = signRefreshToken({ id: payload.id, email: payload.email });

  // update DB with new refresh token
  await RefreshToken.update(
    { token: newRefresh },
    { where: { token: refreshToken } }
  );

  return { accessToken: newAccess, refreshToken: newRefresh };
}
