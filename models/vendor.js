"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vendor.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Vendor.belongsTo(models.VendorCategory, {
        foreignKey: "categoryId",
      });
      Vendor.hasMany(models.Products, {
        foreignKey: "vendorId",
      });
      Vendor.hasMany(models.OrderItems, {
        foreignKey: "vendorId",
      });
      Vendor.hasMany(models.ReportMessages, {
        foreignKey: "reportedVendorId",
      });
      Vendor.hasOne(models.Messages, {
        foreignKey: "vendorId",
      });
    }
  }
  Vendor.init(
    {
      userId: DataTypes.INTEGER,
      vendorName: DataTypes.STRING,
      address: DataTypes.STRING,
      position: DataTypes.GEOMETRY("POINT"),
      phone: DataTypes.STRING,
      avatarUrl: DataTypes.STRING,
      bannerUrl: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      openingHour: DataTypes.TEXT,
      isOpen: DataTypes.BOOLEAN,
      isSuspended: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Vendor",
    }
  );
  return Vendor;
};
