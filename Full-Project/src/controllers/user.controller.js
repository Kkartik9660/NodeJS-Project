import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";

let models;
async function getModels() {
  if (!models) models = initModels(sequelize);
  return models;
}

export async function getProfile(req, res, next) {
  try {
    const { User } = await getModels();
    const user = await User.findByPk(req.user.id, { attributes: ["id","name","email","phone","isVerified","createdAt"] });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
