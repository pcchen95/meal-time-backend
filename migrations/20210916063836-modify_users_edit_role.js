'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'role', {
      allowNull: false,
      defaultValue: 'member',
      type: Sequelize.ENUM('member', 'vendor', 'admin', 'suspended'),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'role', {
      allowNull: false,
      defaultValue: 'all',
      type: Sequelize.ENUM('all', 'member', 'vendor', 'admin', 'suspended'),
    });
  },
};
