module.exports = (sequelize, DataTypes) => {
  const ExpenseCategory = sequelize.define("ExpenseCategory", {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  ExpenseCategory.associate = (models) => {
    ExpenseCategory.belongsTo(models.Company);
  };

  return ExpenseCategory;
};
