module.exports = (sequelize, DataTypes) => {
  const SaleProduct = sequelize.define('SaleProduct', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ProductId: {
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
    },
    paymentMethod: {
      type: DataTypes.STRING(50), // 💳 Nakit, Kredi Kartı, vb.
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT, // 📝 Uzun açıklama veya notlar
      allowNull: true
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  SaleProduct.associate = models => {
    SaleProduct.belongsTo(models.Customer, { foreignKey: 'CustomerId' });
    SaleProduct.belongsTo(models.Product, { foreignKey: 'ProductId' });
    SaleProduct.belongsTo(models.Sale, { foreignKey: 'SaleId' });
    SaleProduct.hasMany(models.Payment, { foreignKey: 'SaleProductId' });
  };

  return SaleProduct;
};
