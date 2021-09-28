'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OrderItems', 'vendorId');
    await queryInterface.removeColumn('OrderItems', 'clientId');
    await queryInterface.removeColumn('OrderItems', 'totalQuantity');
    await queryInterface.removeColumn('OrderItems', 'totalPrice');
    await queryInterface.removeColumn('OrderItems', 'pickupTime');
    await queryInterface.removeColumn('OrderItems', 'content');
    await queryInterface.removeColumn('OrderItems', 'isPaid');
    await queryInterface.removeColumn('OrderItems', 'isComplete');
    await queryInterface.removeColumn('OrderItems', 'isCanceledByVendor');
    await queryInterface.removeColumn('OrderItems', 'isCanceledByClient');
    await queryInterface.addColumn('OrderItems', 'productId', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('OrderItems', 'orderId', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('OrderItems', 'quantity', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OrderItems', 'vendorId', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('OrderItems', 'clientId', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('OrderItems', 'totalQuantity', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('OrderItems', 'totalPrice', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('OrderItems', 'pickupTime', {
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn('OrderItems', 'content', {
      allowNull: false,
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('OrderItems', 'isPaid', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('OrderItems', 'isComplete', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('OrderItems', 'isCanceledByVendor', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('OrderItems', 'isCanceledByClient', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.removeColumn('OrderItems', 'productId');
    await queryInterface.removeColumn('OrderItems', 'orderId');
    await queryInterface.removeColumn('OrderItems', 'quantity');
  },
};
