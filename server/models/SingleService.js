module.exports = (sequelize, DataTypes) => {
  const SingleService = sequelize.define('SingleService', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CompanyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

 
  return SingleService;
};
