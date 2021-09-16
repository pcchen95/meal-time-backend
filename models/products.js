'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Products.belongsTo(models.Vendor, {
        foreignKey: 'vendorId',
      });
      Products.belongsTo(models.ProductCategories, {
        foreignKey: 'categoryId',
      });
      Products.hasMany(models.ReportMessages, {
        foreignKey: 'reportedProductId',
      });
    }
  }
  Products.init(
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
      modelName: 'Products',
    }
  );
  return Products;
};
