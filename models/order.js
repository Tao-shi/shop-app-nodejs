const { Schema } = require("mongoose");

const mongoose = require("mongoose");

const orderSchema = new Schema({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
});

orderSchema.methods.getOrders = function () {
  
}

module.exports = mongoose.model("Order", orderSchema);

// const Sequelize = require("sequelize");

// const sequelize = require("../utils/database");

// const Order = sequelize.define("order", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//     allowNull: false,
//   },
// });

// module.exports = Order;
