module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SaleProduct', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ProductId: { // ✅ ProductId zorunlu alan, NULL olamaz
      type: DataTypes.INTEGER,
      allowNull: false
    },
    SaleId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
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
