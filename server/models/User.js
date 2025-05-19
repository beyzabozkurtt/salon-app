module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING, // Email eşsiz olmalı
    phone: DataTypes.STRING, // 📞 Yeni eklendi
    role: {
      type: DataTypes.ENUM('admin', 'personel'),
      defaultValue: 'personel',
    },
    clientGender: {
      type: DataTypes.STRING, // "Kadın", "Erkek", "Farketmez"
      allowNull: true
    },
    userGender: {
      type: DataTypes.STRING, // "Kadın", "Erkek"
      allowNull: true
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    hizmetNakit: DataTypes.INTEGER,
    hizmetKart: DataTypes.INTEGER,
    urunNakit: DataTypes.INTEGER,
    urunKart: DataTypes.INTEGER,
    paketNakit: DataTypes.INTEGER,
    paketKart: DataTypes.INTEGER,
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });
};
