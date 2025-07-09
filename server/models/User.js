module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'personel'),
      defaultValue: 'personel',
    },
    clientGender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userGender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    // ✅ HİZMET PRİMLERİ
    hizmetTl: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hizmetYuzde: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // ✅ ÜRÜN PRİMLERİ
    urunTl: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    urunYuzde: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // ✅ PAKET PRİMLERİ
    paketTl: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paketYuzde: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

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
