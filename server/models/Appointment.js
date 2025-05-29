module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: 'Randevu tarihi zorunludur.' },
        isDate: { msg: 'Geçerli bir tarih formatı olmalıdır.' }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Geçerli bir bitiş tarihi formatı olmalıdır.' }
      }
    },
    status: {
      type: DataTypes.ENUM('bekliyor', 'tamamlandı', 'iptal'),
      defaultValue: 'bekliyor'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    SaleId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SaleSingleServiceId: {
      type: DataTypes.INTEGER,
      allowNull: true
},
    sessionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Appointment;
};
