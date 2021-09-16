'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'role', {
      allowNull: false,
      defaultValue: 'all',
      type: Sequelize.ENUM('all', 'member', 'vendor', 'admin', 'suspended'),
    });
    await queryInterface.removeColumn('Users', 'isAdmin');
    await queryInterface.removeColumn('Users', 'isVendor');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.addColumn('Users', 'isAdmin', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Users', 'isVendor', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
  },
};
