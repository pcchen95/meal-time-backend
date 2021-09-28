'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderNumber: {
        allowNull: false,
        type: Sequelize.STRING(16),
      },
      vendorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      clientId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      totalQuantity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      totalPrice: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      pickupTime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      isPaid: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      isCompleted: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      isCanceledByVendor: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      isCanceledByClient: {
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('Orders');
  },
};
