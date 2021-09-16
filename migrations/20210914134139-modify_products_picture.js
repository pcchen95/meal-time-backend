'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Products', 'pictureUrl', {
      allowNull: false,
      type: Sequelize.STRING(64),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Products', 'pictureUrl', {
      type: Sequelize.STRING(64),
    });
  },
};
