module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Customer', {
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      registered_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  };
  