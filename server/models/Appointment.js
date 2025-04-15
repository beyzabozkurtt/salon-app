module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Appointment', {
      date: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('bekliyor', 'tamamlandı', 'iptal'),
        defaultValue: 'bekliyor',
      },
      notes: DataTypes.TEXT,
    });
  };
  