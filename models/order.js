const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Pending",
    enum:["Pending", "Shipped", "Delivered", "Cancelled"]
    },
});
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);