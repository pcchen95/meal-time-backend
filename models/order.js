'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
      });
      Order.belongsTo(models.Vendor, {
        foreignKey: 'vendorId',
      });
      Order.belongsTo(models.User, {
        foreignKey: 'clientId',
      });
    }
  }
  Order.init(
    {
      orderNumber: DataTypes.STRING,
      vendorId: DataTypes.INTEGER,
      clientId: DataTypes.INTEGER,
      totalQuantity: DataTypes.INTEGER,
      totalPrice: DataTypes.INTEGER,
      pickupTime: DataTypes.DATE,
      remarks: DataTypes.TEXT,
      isPaid: DataTypes.BOOLEAN,
      isCompleted: DataTypes.BOOLEAN,
      isCanceledByVendor: DataTypes.BOOLEAN,
      isCanceledByClient: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );
  return Order;
};
