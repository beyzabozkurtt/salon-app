// models/UserWorkingHours.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("UserWorkingHours", {
    day: {
      type: DataTypes.STRING, // "Pazartesi", "Salı" vb.
      allowNull: false,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    breakStart: DataTypes.TIME,
    breakEnd: DataTypes.TIME,
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};
