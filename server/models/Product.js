module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),

    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },

    barcode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    SaleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Sales',
        key: 'id'
      }
    },

    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};
