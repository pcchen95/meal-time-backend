'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FaqCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FaqCategory.hasMany(models.Faq, {
        foreignKey: 'categoryId',
      });
    }
  }
  FaqCategory.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'FaqCategory',
    }
  );
  return FaqCategory;
};
