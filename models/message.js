"use strict";
module.exports = function(sequelize, DataTypes) {
  var message = sequelize.define("message", {
    body: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });

  message.associate = models => {
    message.belongsTo(models.user, { as: "author", foreignKey: "authorId" });
  };

  return message;
};