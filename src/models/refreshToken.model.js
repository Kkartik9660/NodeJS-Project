import { v4 as uuidv4 } from "uuid";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4
      },
      token: { type: DataTypes.TEXT, allowNull: false },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false }
    },
    { tableName: "refresh_tokens" }
  );
}
