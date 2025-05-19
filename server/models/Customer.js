module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Customer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    registered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};
