const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,

    ref: "User",

    required: true,
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Product",

        required: true,
      },

      name: String,

      price: Number,

      quantity: Number,
    },
  ],

  totalAmount: {
    type: Number,

    required: true,
  },

  orderDate: {
    type: Date,

    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
