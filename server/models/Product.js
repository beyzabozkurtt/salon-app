module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Product', {
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
    });
  };
  