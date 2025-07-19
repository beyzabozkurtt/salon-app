// models/Prim.js
module.exports = (sequelize, DataTypes) => {
  const Prim = sequelize.define("Prim", {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM("paket", "ürün", "hizmet"),
      allowNull: false,
    },
    sourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Prim.associate = (models) => {
    Prim.belongsTo(models.User, { foreignKey: "UserId" });
    Prim.belongsTo(models.Company, { foreignKey: "CompanyId" });
  };

  return Prim;
};
