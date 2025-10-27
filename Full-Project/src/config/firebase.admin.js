import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(process.cwd(), "firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const firebaseDb = admin.database();
