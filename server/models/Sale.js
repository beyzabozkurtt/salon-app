module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Sale', {
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    session: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    installment: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });
};
