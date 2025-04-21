module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Service', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: DataTypes.DECIMAL(10, 2),
    duration: DataTypes.INTEGER // dakika cinsinden
  });
};
