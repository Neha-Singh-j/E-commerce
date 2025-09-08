const express = require('express');
const router = express.Router();
const Order = require('../models/order');
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
router.post('/place-order', isLoggedIn, async (req, res) => {
  try {
    const items = [{
        product: req.body['items[0][product]'],
        quantity: req.body['items[0][quantity]']
    }];

    const newOrder = new Order({
        user: req.user._id,
        items: items
    });

    await newOrder.save();
    res.redirect('/orders')
}catch(err) {
    console.error(err);
    res.status(500).send('Error placing an order');
}
});
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ orderDate: -1 });
    res.render('orders', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching orders');
  }
});
module.exports = router;