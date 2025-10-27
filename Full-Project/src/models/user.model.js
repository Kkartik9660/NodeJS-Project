import { v4 as uuidv4 } from "uuid";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING, allowNull: true, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    { tableName: "users" }
  );
}