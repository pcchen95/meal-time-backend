"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Vendor, {
        foreignKey: "userId",
      });
      User.hasMany(models.OrderItems, {
        foreignKey: "clientId",
      });
      User.hasMany(models.ReportMessages, {
        foreignKey: "userId",
      });
      User.hasOne(models.Messages, {
        foreignKey: "clientId",
      });
      User.hasOne(models.MessagesToAdmin, {
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      nickname: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
      isVendor: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
