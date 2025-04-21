module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    SaleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Sales',
        key: 'id'
      }
    }
  });
};
