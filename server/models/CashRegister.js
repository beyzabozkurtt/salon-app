module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CashRegister', {
      date: DataTypes.DATEONLY,
      total_sales: DataTypes.DECIMAL(10, 2),
      notes: DataTypes.TEXT,
      CompanyId: {
  type: DataTypes.INTEGER,
  allowNull: false
}

    });
  };
  