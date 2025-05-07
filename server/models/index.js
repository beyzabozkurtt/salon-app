const sequelize = require('../config/config');
const { DataTypes } = require('sequelize');

// 🔁 Modelleri çağır
const User = require('./User')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const Service = require('./Service')(sequelize, DataTypes);
const Appointment = require('./Appointment')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Sale = require('./Sale')(sequelize, DataTypes);
const SaleProduct = require('./saleProduct')(sequelize, DataTypes);
const CashRegister = require('./CashRegister')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);

// 🔗 İlişkiler
User.hasMany(Appointment);
Appointment.belongsTo(User);

Customer.hasMany(Appointment);
Appointment.belongsTo(Customer);

Service.hasMany(Appointment);
Appointment.belongsTo(Service);

Appointment.hasMany(Sale);
Sale.belongsTo(Appointment);

Customer.hasMany(Sale);
Sale.belongsTo(Customer);

User.hasMany(Sale);
Sale.belongsTo(User);

Service.hasMany(Sale);
Sale.belongsTo(Service);

User.hasMany(Payment, { foreignKey: 'UserId' });
Payment.belongsTo(User, { foreignKey: 'UserId' });

// 🟢 Ödeme - Hizmet Satışı ilişkisi
Sale.hasMany(Payment, { foreignKey: 'SaleId', onDelete: 'CASCADE' });
Payment.belongsTo(Sale, { foreignKey: 'SaleId' });

// 🟢 Ödeme - Ürün ilişkisi
Product.hasMany(Payment, {
  foreignKey: 'ProductId',
  onDelete: 'SET NULL',
  hooks: true
});
Payment.belongsTo(Product, {
  foreignKey: 'ProductId'
});

// 🆕 Ödeme - SaleProduct ilişkisi (ÜRÜN ÖDEMELERİ İÇİN)
SaleProduct.hasMany(Payment, {
  foreignKey: 'SaleProductId',
  onDelete: 'SET NULL'
});
Payment.belongsTo(SaleProduct, {
  foreignKey: 'SaleProductId'
});

// ✅ SaleProduct ilişkileri
Sale.hasMany(SaleProduct, {
  foreignKey: 'SaleId',
  onDelete: 'CASCADE',
  hooks: true
});
Product.hasMany(SaleProduct, {
  foreignKey: 'ProductId',
  onDelete: 'CASCADE',
  hooks: true
});

SaleProduct.belongsTo(Sale, { foreignKey: 'SaleId' });
SaleProduct.belongsTo(Product, { foreignKey: 'ProductId' });
SaleProduct.belongsTo(User);
SaleProduct.belongsTo(Customer, { foreignKey: 'CustomerId' });

Sale.belongsToMany(Product, { through: SaleProduct });
Product.belongsToMany(Sale, { through: SaleProduct });

// 🔚 Export
module.exports = {
  sequelize,
  User,
  Customer,
  Service,
  Appointment,
  Product,
  Sale,
  SaleProduct,
  CashRegister,
  Payment,
};
