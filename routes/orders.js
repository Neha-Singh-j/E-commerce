// routes/orders.js
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares');
const Order = require('../models/orders'); // your file is models/orders.js

router.get('/history', isLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ orderDate: -1 })
      .lean();

    res.render('orders/history', {
      title: 'Order History',
      orders, // array of orders
    });
  } catch (e) {
    console.error(e);
    req.flash('error_msg', 'Could not fetch order history.');
    res.redirect('/');
  }
});

module.exports = router;
