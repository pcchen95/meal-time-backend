'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Products',
      'pictureUrl',
      {
        allowNull: false,
        type: Sequelize.STRING(64), 
      }
    ),
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Users', 'pictureUrl')
  }
};
