// models/Expense.js
module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    expenseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true // nakit, kart, havale, vs.
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true // ödemeyi yapan personel
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Expense.associate = (models) => {
    Expense.belongsTo(models.User, { foreignKey: 'UserId' });
    Expense.belongsTo(models.Company, { foreignKey: 'CompanyId' });
  };

  return Expense;
};
