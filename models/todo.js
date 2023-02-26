'use strict';
module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define('Todo', {
    name: DataTypes.STRING,
    isDone: DataTypes.BOOLEAN
  }, {});
  Todo.associate = function(models) {
    // associations can be defined here:(Todo belongs to a user)一對一
    Todo.belongsTo(models.User)
  };
  return Todo;
};