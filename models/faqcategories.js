'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FaqCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FaqCategories.hasMany(models.Faq, {
        foreignKey: 'categoryId',
      });
    }
  }
  FaqCategories.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'FaqCategories',
    }
  );
  return FaqCategories;
};
