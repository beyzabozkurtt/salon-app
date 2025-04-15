module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Service', {
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      duration: DataTypes.INTEGER, // dakika
    });
  };
  