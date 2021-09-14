"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReportMessages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ReportMessages.belongsTo(models.User, {
        foreignKey: "userId",
      });
      ReportMessages.belongsTo(models.Vendor, {
        foreignKey: "reportedVendorId",
      });
      ReportMessages.belongsTo(models.Products, {
        foreignKey: "reportedProductId",
      });
    }
  }
  ReportMessages.init(
    {
      userId: DataTypes.INTEGER,
      reportedVendorId: DataTypes.INTEGER,
      reportedProductId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ReportMessages",
    }
  );
  return ReportMessages;
};
