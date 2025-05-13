module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'companies', // tablo adın küçük harfle ve çoğulsa belirt
    timestamps: true,       // createdAt ve updatedAt aktif
  });

  return Company;
};
