'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Vendors', 'isSuspended', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'openingHour', {
      allowNull: false,
      type: Sequelize.TEXT,
    });
    await queryInterface.removeColumn('Vendors', 'isOpenMon');
    await queryInterface.removeColumn('Vendors', 'startTimeMon');
    await queryInterface.removeColumn('Vendors', 'closingTimeMon');
    await queryInterface.removeColumn('Vendors', 'isOpenTue');
    await queryInterface.removeColumn('Vendors', 'startTimeTue');
    await queryInterface.removeColumn('Vendors', 'closingTimeTue');
    await queryInterface.removeColumn('Vendors', 'isOpenWed');
    await queryInterface.removeColumn('Vendors', 'startTimeWed');
    await queryInterface.removeColumn('Vendors', 'closingTimeWed');
    await queryInterface.removeColumn('Vendors', 'isOpenThu');
    await queryInterface.removeColumn('Vendors', 'startTimeThu');
    await queryInterface.removeColumn('Vendors', 'closingTimeThu');
    await queryInterface.removeColumn('Vendors', 'isOpenFri');
    await queryInterface.removeColumn('Vendors', 'startTimeFri');
    await queryInterface.removeColumn('Vendors', 'closingTimeFri');
    await queryInterface.removeColumn('Vendors', 'isOpenSat');
    await queryInterface.removeColumn('Vendors', 'startTimeSat');
    await queryInterface.removeColumn('Vendors', 'closingTimeSat');
    await queryInterface.removeColumn('Vendors', 'isOpenSun');
    await queryInterface.removeColumn('Vendors', 'startTimeSun');
    await queryInterface.removeColumn('Vendors', 'closingTimeSun');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Vendors', 'isSuspended');
    await queryInterface.removeColumn('Vendors', 'openingHour');
    await queryInterface.addColumn('Vendors', 'isOpenMon', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeMon');
    await queryInterface.addColumn('Vendors', 'isOpenTue', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeTue', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'closingTimeTue', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'isOpenWed', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeWed', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'closingTimeWed', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'isOpenThu', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeThu', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'closingTimeThu', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'isOpenFri', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeFri', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'closingTimeFri', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'isOpenSat', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeSat', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'closingTimeSat', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'isOpenSun', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    });
    await queryInterface.addColumn('Vendors', 'startTimeSun', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('Vendors', 'closingTimeSun', {
      type: Sequelize.STRING(8),
    });
  },
};
