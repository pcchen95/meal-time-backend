"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("Vendors", "isSuspended", {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    }),
      queryInterface.addColumn("Users", "openingHour", {
        allowNull: false,
        type: Sequelize.text,
      });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Vendors', 'isOpenMon'),
    queryInterface.removeColumn('Vendors', 'startTimeMon'),
    queryInterface.removeColumn('Vendors', 'closingTimeMon'),
    queryInterface.removeColumn('Vendors', 'isOpenTue'),
    queryInterface.removeColumn('Vendors', 'startTimeTue'),
    queryInterface.removeColumn('Vendors', 'closingTimeTue'),
    queryInterface.removeColumn('Vendors', 'isOpenWed'),
    queryInterface.removeColumn('Vendors', 'startTimeWed'),
    queryInterface.removeColumn('Vendors', 'closingTimeWed'),
    queryInterface.removeColumn('Vendors', 'isOpenThu'),
    queryInterface.removeColumn('Vendors', 'startTimeThu'),
    queryInterface.removeColumn('Vendors', 'closingTimeThu'),
    queryInterface.removeColumn('Vendors', 'isOpenFri'),
    queryInterface.removeColumn('Vendors', 'startTimeFri'),
    queryInterface.removeColumn('Vendors', 'closingTimeFri'),
    queryInterface.removeColumn('Vendors', 'isOpenSat'),
    queryInterface.removeColumn('Vendors', 'startTimeSat'),
    queryInterface.removeColumn('Vendors', 'closingTimeSat'),
    queryInterface.removeColumn('Vendors', 'isOpenSun'),
    queryInterface.removeColumn('Vendors', 'startTimeSun'),
    queryInterface.removeColumn('Vendors', 'closingTimeSun'),
  },
};
