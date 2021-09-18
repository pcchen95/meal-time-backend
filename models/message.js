'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User, {
        foreignKey: 'clientId',
      });
      Message.belongsTo(models.Vendor, {
        foreignKey: 'vendorId',
      });
    }
  }
  Message.init(
    {
      clientId: DataTypes.INTEGER,
      vendorId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Message',
    }
  );
  return Message;
};
