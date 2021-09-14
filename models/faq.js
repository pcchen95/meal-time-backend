"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Faq.belongsTo(models.FaqCategories, {
        foreignKey: categoryId,
      });
    }
  }
  Faq.init(
    {
      question: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
      answer: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Faq",
    }
  );
  return Faq;
};
