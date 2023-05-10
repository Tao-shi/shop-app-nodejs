const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const OrderItem = sequelize.define("orderItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    },
    quantity: {
        type: Sequelize.INTEGER
    }
});

module.exports = OrderItem;
