import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false
  }
);

export async function initDb() {
  try {
    // import models AFTER sequelize export to avoid circular issues
    await sequelize.authenticate();
    console.log("MySQL connected");
    // Import models and sync
    const { initModels } = await import("../models/index.js");
    initModels(sequelize);
    await sequelize.sync({ alter: true }); // alter true for dev; change in prod
    console.log("DB synced");
  } catch (err) {
    console.error("DB init error:", err);
    throw err;
  }
}
