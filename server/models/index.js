const sequelize = require('../config/config');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const Service = require('./Service')(sequelize, DataTypes);
const Appointment = require('./Appointment')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Sale = require('./Sale')(sequelize, DataTypes);
const SaleProduct = require('./saleProduct')(sequelize, DataTypes);
const CashRegister = require('./CashRegister')(sequelize, DataTypes);

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

// ✅ SaleProduct ilişkileri
SaleProduct.belongsTo(Sale);
SaleProduct.belongsTo(Product);
SaleProduct.belongsTo(User);
SaleProduct.belongsTo(Customer); // 🆕 CustomerId ilişkisi eklendi

// ✅ Sale <-> Product çoktan çoğa ilişki
Sale.belongsToMany(Product, { through: SaleProduct });
Product.belongsToMany(Sale, { through: SaleProduct });

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
};
