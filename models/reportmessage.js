'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ReportMessage.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      ReportMessage.belongsTo(models.Vendor, {
        foreignKey: 'reportedVendorId',
      });
      ReportMessage.belongsTo(models.Product, {
        foreignKey: 'reportedProductId',
      });
    }
  }
  ReportMessage.init(
    {
      userId: DataTypes.INTEGER,
      reportedVendorId: DataTypes.INTEGER,
      reportedProductId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'ReportMessage',
    }
  );
  return ReportMessage;
};
