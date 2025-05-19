module.exports = (sequelize, DataTypes) => {
  const WorkingHours = sequelize.define('WorkingHours', {
    day: {
      type: DataTypes.STRING,
      
    },
    isOpen: DataTypes.BOOLEAN,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    breakStart: DataTypes.TIME,
    breakEnd: DataTypes.TIME,
    CompanyId: {
  type: DataTypes.INTEGER,
  allowNull: false
}

  });

  return WorkingHours;
};
