module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maasGunu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1 // varsayılan maaş günü: her ayın 1'i
    }
  }, {
    tableName: 'companies',
    timestamps: true,
  });

  return Company;
};
