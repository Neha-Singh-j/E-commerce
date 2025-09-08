const Order = require("../models/order"); 
exports.getOrders=async(req, res) => {
  try {
    const orders = await Order.find({user: req.user._id}).populate("items.product");
    res.render('orders', { orders });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};
