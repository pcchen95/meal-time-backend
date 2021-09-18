'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Vendor, {
        foreignKey: 'userId',
      });
      User.hasMany(models.Order, {
        foreignKey: 'clientId',
      });
      User.hasMany(models.ReportMessage, {
        foreignKey: 'userId',
      });
      User.hasOne(models.Message, {
        foreignKey: 'clientId',
      });
      User.hasOne(models.MessagesToAdmin, {
        foreignKey: 'userId',
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
      role: DataTypes.ENUM('all', 'member', 'vendor', 'admin', 'suspended'),
      avatarURL: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
