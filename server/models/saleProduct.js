// models/SaleProduct.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('SaleProduct', {
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    });
  };
  