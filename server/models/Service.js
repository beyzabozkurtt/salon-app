module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Service', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: DataTypes.DECIMAL(10, 2),
    duration: DataTypes.INTEGER, // dakika cinsinden
    CompanyId: {
  type: DataTypes.INTEGER,
  allowNull: false
},  

  });
};
