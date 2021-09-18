'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageToAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MessageToAdmin.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }
  MessageToAdmin.init(
    {
      userId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'MessageToAdmin',
    }
  );
  return MessageToAdmin;
};
