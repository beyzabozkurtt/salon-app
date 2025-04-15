module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Sale', {
      quantity: DataTypes.INTEGER,
      total_price: DataTypes.DECIMAL(10, 2),
    });
  };
  