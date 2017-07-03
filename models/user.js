"use strict";
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define(
    "user",
    {
      userName: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING
      },
      displayName: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {}
    // user.associate goes here
  );
  return user;
};
