"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vendorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(64),
      },
      categoryId: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER,
      },
      pictureUrl: {
        type: Sequelize.STRING(64),
      },
      price: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      manufactureDate: {
        type: Sequelize.DATE,
      },
      expiryDate: {
        type: Sequelize.DATE,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      isAvailable: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Products");
  },
};
