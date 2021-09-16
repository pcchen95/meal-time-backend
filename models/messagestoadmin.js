'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessagesToAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MessagesToAdmin.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }
  MessagesToAdmin.init(
    {
      userId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'MessagesToAdmin',
    }
  );
  return MessagesToAdmin;
};
