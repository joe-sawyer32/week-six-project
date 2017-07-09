"use strict";
module.exports = function(sequelize, DataTypes) {
  var like = sequelize.define("like");

  like.associate = models => {
    like.belongsTo(models.user, { as: "liker", foreignKey: "likerId" });
    like.belongsTo(models.message, { as: "message", foreignKey: "messageId" });
  };

  return like;
};
