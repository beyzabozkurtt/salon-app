module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING, // <-- UNIQUE KALDIRILDI
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'personel'),
      defaultValue: 'personel',
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });
};
