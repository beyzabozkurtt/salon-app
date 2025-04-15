const sequelize = require('../config/config');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const Service = require('./Service')(sequelize, DataTypes);
const Appointment = require('./Appointment')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Sale = require('./Sale')(sequelize, DataTypes);
const CashRegister = require('./CashRegister')(sequelize, DataTypes);

// İlişkiler
User.hasMany(Appointment);
Appointment.belongsTo(User);

Customer.hasMany(Appointment);
Appointment.belongsTo(Customer);

Service.hasMany(Appointment);
Appointment.belongsTo(Service);

Appointment.hasMany(Sale);
Sale.belongsTo(Appointment);

Product.hasMany(Sale);
Sale.belongsTo(Product);

module.exports = {
  sequelize,
  User,
  Customer,
  Service,
  Appointment,
  Product,
  Sale,
  CashRegister,
};
