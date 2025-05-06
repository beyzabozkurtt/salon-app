module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    installmentNo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('bekliyor', 'ödendi'),
      defaultValue: 'bekliyor'
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  // İLİŞKİLER BURADA TANIMLANIYOR
  Payment.associate = (models) => {
    Payment.belongsTo(models.Sale, { foreignKey: 'SaleId' });
    Payment.belongsTo(models.Product, { foreignKey: 'ProductId' }); // ✅ EKLENDİ
  };

  return Payment;
};
