module.exports = (sequelize, DataTypes) => {
  const Salary = sequelize.define('Salary', {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // ⬇️ Yeni sistem: hangi tarih aralığı için geçerli
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    salaryDate: {
      type: DataTypes.DATEONLY, // Ödeme günü (ayın 1’i gibi)
      allowNull: false
    },

    // ⬇️ Maaş bilgileri
    salaryAmount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    urunPrim: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    hizmetPrim: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    paketPrim: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    // ⬇️ Ek kontrol alanları
    isFinalized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdFrom: {
      type: DataTypes.STRING, // "auto" | "manual"
      defaultValue: "auto"
    }

  }, {
    indexes: [
      {
        unique: true,
        fields: ['UserId', 'CompanyId', 'salaryDate']
      }
    ]
  });

  return Salary;
};
