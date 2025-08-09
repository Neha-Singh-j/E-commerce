const express = require("express");
const { isLoggedIn } = require("../middlewares");
const User = require("../models/User");
const Product = require("../models/Product");
const router = express.Router();

router.get("/user/cart", isLoggedIn, async (req, res) => {
  let userId = req.user._id;
  let user = await User.findById(userId).populate("cart");
  //   console.log(user, "sam");
  let totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
  //   console.log(totalAmount);

  res.render("cart/cart", { user, totalAmount });
});

router.post("/user/:productId/add", isLoggedIn, async (req, res) => {
  let { productId } = req.params;
  let userId = req.user._id;
  let user = await User.findById(userId);
  let product = await Product.findById(productId);
  user.cart.push(product);
  await user.save();
  res.redirect("/user/cart");
});

router.post("/user/:productId/delete", isLoggedIn, async (req, res) => {
  try {
      const { productId } = req.params;
      const userId = req.user._id;

      const user = await User.findById(userId);

      // Find index of the first occurrence
      const index = user.cart.findIndex(
        (item) => item.toString() === productId
      );

      // Remove only one occurrence
      if (index !== -1) {
        user.cart.splice(index, 1);
      }

      await user.save();
      res.redirect("/user/cart");
    } catch (err) {
      console.error("Error removing product from cart:", err);
      res.status(500).send("Something went wrong");
    }

});



module.exports = router;