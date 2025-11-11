// src/models/index.js
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    define: {
      underscored: true,
      freezeTableName: false,
    },
  }
);

// import model factories
const User = require("./user")(sequelize, DataTypes);
const Post = require("./post")(sequelize, DataTypes);
const Like = require("./like")(sequelize, DataTypes);
const Comment = require("./comment")(sequelize, DataTypes);
const Message = require("./message")(sequelize, DataTypes);

// associations
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

User.belongsToMany(Post, {
  through: Like,
  as: "LikedPosts",
  foreignKey: "userId",
});
Post.belongsToMany(User, { through: Like, as: "Likers", foreignKey: "postId" });

Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
Comment.belongsTo(Post, { foreignKey: "postId" });
User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

module.exports = {
  sequelize,
  User,
  Post,
  Like,
  Comment,
  Message,
};
