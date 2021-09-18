'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Vendor, {
        foreignKey: 'vendorId',
      });
      Product.belongsTo(models.ProductCategory, {
        foreignKey: 'categoryId',
      });
      Product.hasMany(models.ReportMessage, {
        foreignKey: 'reportedProductId',
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: 'productId',
      });
    }
  }
  Product.init(
    {
      vendorId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
      pictureUrl: DataTypes.STRING,
      price: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      manufactureDate: DataTypes.DATE,
      expiryDate: DataTypes.DATE,
      description: DataTypes.TEXT,
      isAvailable: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Product',
    }
  );
  return Product;
};
