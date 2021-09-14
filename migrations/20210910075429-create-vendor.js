"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Vendors", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      vendorName: {
        allowNull: false,
        type: Sequelize.STRING(64),
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING(128),
      },
      position: {
        allowNull: false,
        type: Sequelize.GEOMETRY("POINT"),
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING(16),
      },
      avatarUrl: {
        type: Sequelize.STRING(64),
      },
      bannerUrl: {
        type: Sequelize.STRING(64),
      },
      categoryId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.TEXT,
      },
      isOpenMon: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeMon: {
        type: Sequelize.STRING(8),
      },
      closingTimeMon: {
        type: Sequelize.STRING(8),
      },
      isOpenTue: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeTue: {
        type: Sequelize.STRING(8),
      },
      closingTimeTue: {
        type: Sequelize.STRING(8),
      },
      isOpenWed: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeWed: {
        type: Sequelize.STRING(8),
      },
      closingTimeWed: {
        type: Sequelize.STRING(8),
      },
      isOpenThu: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeThu: {
        type: Sequelize.STRING(8),
      },
      closingTimeThu: {
        type: Sequelize.STRING(8),
      },
      isOpenFri: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeFri: {
        type: Sequelize.STRING(8),
      },
      closingTimeFri: {
        type: Sequelize.STRING(8),
      },
      isOpenSat: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeSat: {
        type: Sequelize.STRING(8),
      },
      closingTimeSat: {
        type: Sequelize.STRING(8),
      },
      isOpenSun: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startTimeSun: {
        type: Sequelize.STRING(8),
      },
      closingTimeSun: {
        type: Sequelize.STRING(8),
      },
      isOpen: {
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
    await queryInterface.dropTable("Vendors");
  },
};
