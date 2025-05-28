module.exports = (sequelize, DataTypes) => {
  const SaleSingleService = sequelize.define("SaleSingleService", {
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    SingleServiceId: {
      type: DataTypes.INTEGER,
      allowNull: true  // Tek seferlik hizmet için, zorunlu değil
    },
    AppointmentId: {
      type: DataTypes.INTEGER,
      allowNull: true // Randevu sonradan ekleniyorsa
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  SaleSingleService.associate = (models) => {
    SaleSingleService.belongsTo(models.Customer, { foreignKey: 'CustomerId' });
    SaleSingleService.belongsTo(models.SingleService, { foreignKey: 'SingleServiceId' }); // Tek seferlik
    SaleSingleService.belongsTo(models.Appointment, { foreignKey: 'AppointmentId' });
    SaleSingleService.belongsTo(models.Company, { foreignKey: 'CompanyId' });
    SaleSingleService.belongsTo(models.User, { foreignKey: 'UserId' });
  };

  return SaleSingleService;
};
