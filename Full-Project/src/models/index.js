import { DataTypes } from "sequelize";
import UserModel from "./user.model.js";
import PostModel from "./post.model.js";
import RefreshTokenModel from "./refreshToken.model.js";

export function initModels(sequelize) {
  const User = UserModel(sequelize, DataTypes);
  const Post = PostModel(sequelize, DataTypes);
  const RefreshToken = RefreshTokenModel(sequelize, DataTypes);

  // associations
  User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
  Post.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
  RefreshToken.belongsTo(User, { foreignKey: "userId" });

  return { User, Post, RefreshToken };
}
