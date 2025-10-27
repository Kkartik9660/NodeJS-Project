import admin from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export function initFirebase() {
  try {
    const pathToKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!pathToKey) return null;
    const serviceAccount = JSON.parse(fs.readFileSync(pathToKey, "utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase initialized");
    return admin;
  } catch (err) {
    console.warn("Firebase init failed:", err.message);
    return null;
  }
}
