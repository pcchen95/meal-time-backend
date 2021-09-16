'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItems.belongsTo(models.User, {
        foreignKey: 'clientId',
      });
      OrderItems.belongsTo(models.Vendor, {
        foreignKey: 'vendorId',
      });
    }
  }
  OrderItems.init(
    {
      vendorId: DataTypes.INTEGER,
      clientId: DataTypes.INTEGER,
      totalQuantity: DataTypes.INTEGER,
      totalPrice: DataTypes.INTEGER,
      pickupTime: DataTypes.DATE,
      content: DataTypes.TEXT,
      isPaid: DataTypes.BOOLEAN,
      isComplete: DataTypes.BOOLEAN,
      isCanceledByVendor: DataTypes.BOOLEAN,
      isCanceledByClient: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'OrderItems',
    }
  );
  return OrderItems;
};
