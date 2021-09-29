'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
      });
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'productId',
      });
    }
  }
  OrderItem.init(
    {
      productId: DataTypes.INTEGER,
      orderId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'OrderItem',
    }
  );
  return OrderItem;
};
