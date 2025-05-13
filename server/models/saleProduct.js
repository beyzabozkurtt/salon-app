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
    CompanyId: {
  type: DataTypes.INTEGER,
  allowNull: false
}

  });

  // 🧩 İlişkiler burada tanımlanmalı
  SaleProduct.associate = models => {
    SaleProduct.belongsTo(models.Customer, { foreignKey: 'CustomerId' });
    SaleProduct.belongsTo(models.Product, { foreignKey: 'ProductId' });
    SaleProduct.belongsTo(models.Sale, { foreignKey: 'SaleId' });

    // 💸 Her ürün satışı birden fazla ödemeyle eşleşebilir
    SaleProduct.hasMany(models.Payment, { foreignKey: 'SaleProductId' });
  };

  return SaleProduct;
};
