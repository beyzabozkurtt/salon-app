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
const WorkingHours = require('./WorkingHours')(sequelize, DataTypes);
const Company = require('./Company')(sequelize, DataTypes);
const SingleService = require('./SingleService')(sequelize, DataTypes);
const SaleSingleService = require('./SaleSingleService')(sequelize, DataTypes);
const Expense = require('./Expense')(sequelize, DataTypes);
const ExpenseCategory = require("./ExpenseCategory")(sequelize, DataTypes);
const Salary = require('./Salary')(sequelize, DataTypes);
const Prim = require('./Prim')(sequelize, DataTypes);
const UserWorkingHours = require('./UserWorkingHours')(sequelize, DataTypes);





// 🔗 İlişkiler
// 🔗 SaleSingleService ilişkileri
Customer.hasMany(SaleSingleService, { foreignKey: 'CustomerId' });
SaleSingleService.belongsTo(Customer, { foreignKey: 'CustomerId' });

User.hasMany(SaleSingleService, { foreignKey: 'UserId' });
SaleSingleService.belongsTo(User, { foreignKey: 'UserId' });

Company.hasMany(SaleSingleService, { foreignKey: 'CompanyId' });
SaleSingleService.belongsTo(Company, { foreignKey: 'CompanyId' });

SingleService.hasMany(SaleSingleService, { foreignKey: 'SingleServiceId' });
SaleSingleService.belongsTo(SingleService, { foreignKey: 'SingleServiceId' });

Appointment.hasOne(SaleSingleService, { foreignKey: 'AppointmentId' });
SaleSingleService.belongsTo(Appointment, { foreignKey: 'AppointmentId' });

User.hasMany(Appointment);
Appointment.belongsTo(User);

Sale.hasMany(Appointment);
Appointment.belongsTo(Sale);

SingleService.hasMany(Appointment);
Appointment.belongsTo(SingleService);


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

// 👤 Salary - User ilişkisi
User.hasMany(Salary);
Salary.belongsTo(User);

// 💼 Salary - Sale ilişkisi
Salary.hasMany(Sale);
Sale.belongsTo(Salary);

// 💊 Salary - SaleProduct ilişkisi
Salary.hasMany(SaleProduct);
SaleProduct.belongsTo(Salary);

// 🛎️ Salary - SaleSingleService ilişkisi
Salary.hasMany(SaleSingleService);
SaleSingleService.belongsTo(Salary);

Company.hasMany(ExpenseCategory, { foreignKey: 'CompanyId' });
ExpenseCategory.belongsTo(Company, { foreignKey: 'CompanyId' });


User.hasMany(UserWorkingHours, { foreignKey: 'UserId' });
UserWorkingHours.belongsTo(User, { foreignKey: 'UserId' });

Company.hasMany(UserWorkingHours, { foreignKey: 'CompanyId' });
UserWorkingHours.belongsTo(Company, { foreignKey: 'CompanyId' });


User.hasMany(Payment, { foreignKey: 'UserId' });
Payment.belongsTo(User, { foreignKey: 'UserId' });

Sale.hasMany(Payment, {
  foreignKey: 'SaleId',
  onDelete: 'CASCADE',
  hooks: true
});
Payment.belongsTo(Sale, { foreignKey: 'SaleId' });

// ✅ Tekli hizmet ödemeleri için ilişki
SaleSingleService.hasMany(Payment, { foreignKey: 'SaleSingleServiceId' });
Payment.belongsTo(SaleSingleService, { foreignKey: 'SaleSingleServiceId' });


Customer.hasMany(Payment, { foreignKey: 'CustomerId' });
Payment.belongsTo(Customer, { foreignKey: 'CustomerId' });

Product.hasMany(Payment, {
  foreignKey: 'ProductId',
  onDelete: 'SET NULL',
  hooks: true
});
Payment.belongsTo(Product, {
  foreignKey: 'ProductId'
});

SaleProduct.hasMany(Payment, {
  foreignKey: 'SaleProductId',
  onDelete: 'SET NULL'
});
Payment.belongsTo(SaleProduct, {
  foreignKey: 'SaleProductId'
});

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


// ✅ Çoklu ürün satışı bağlantısı
Sale.belongsToMany(Product, { through: SaleProduct });
Product.belongsToMany(Sale, { through: SaleProduct });


// ✅ 🔗 Company ilişkileri (Multi-Tenant yapı)
Company.hasMany(User);
User.belongsTo(Company);

Company.hasMany(Customer);
Customer.belongsTo(Company);

Company.hasMany(SingleService);
SingleService.belongsTo(Company);

Company.hasMany(Service);
Service.belongsTo(Company);

Company.hasMany(Product);
Product.belongsTo(Company);

Company.hasMany(Appointment);
Appointment.belongsTo(Company);

Company.hasMany(Sale);
Sale.belongsTo(Company);

Company.hasMany(Payment);
Payment.belongsTo(Company);

Company.hasMany(WorkingHours);
WorkingHours.belongsTo(Company);

Company.hasMany(CashRegister);
CashRegister.belongsTo(Company);

Company.hasMany(Expense);
Expense.belongsTo(Company);

User.hasMany(Expense);
Expense.belongsTo(User);

Company.hasMany(SaleProduct);
SaleProduct.belongsTo(Company); // eğer CompanyId eklediysen buraya da bağladım

// 🔚 Export
module.exports = {
  sequelize,
  User,
  Customer,
  Service,
  Appointment,
  Product,
  Expense,
  Sale,
  Salary,
  SaleProduct,
  CashRegister,
  Payment,
  WorkingHours,
  SaleSingleService,
  Company,
  SingleService,
  ExpenseCategory,
  Prim,
  UserWorkingHours
};
