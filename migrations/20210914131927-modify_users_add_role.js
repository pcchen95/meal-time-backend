'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Users',
      'role',
      {
        allowNull: false,
        defaultValue: 'all',
        type: Sequelize.ENUM('all', 'member', 'vendor', 'admin', 'suspended'), 
      }
    ),
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Users', 'isAdmin'),
    queryInterface.removeColumn('Users', 'isVendor'),
  }
};
