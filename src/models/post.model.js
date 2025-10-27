import { v4 as uuidv4 } from "uuid";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "Post",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4
      },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: true },
      userId: { type: DataTypes.UUID, allowNull: false }
    },
    { tableName: "posts" }
  );
}
