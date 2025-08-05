const express = require("express");
const { isLoggedIn } = require("../../middlewares");
const { validateInput, sanitizeInput } = require("../../middlewares/security");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Joi = require("joi");
const router = express.Router();

// Validation schemas
const addToCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).default(1),
});

const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required(),
});

// View cart
router.get("/", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: "cart.product",
        select: "name price img stock"
      });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/auth/login");
    }

    // Calculate totals
    let totalAmount = 0;
    let totalItems = 0;
    const cartItems = [];

    for (const item of user.cart) {
      if (item.product) {
        const itemTotal = item.product.price * item.quantity;
        totalAmount += itemTotal;
        totalItems += item.quantity;
        cartItems.push({
          product: item.product,
          quantity: item.quantity,
          total: itemTotal
        });
      }
    }

    res.render("cart/cart", {
      cartItems,
      totalAmount: totalAmount.toFixed(2),
      totalItems,
      title: "Shopping Cart - Shopiko"
    });
  } catch (error) {
    console.error("Cart view error:", error);
    req.flash("error", "Failed to load cart");
    res.redirect("/products");
  }
});

// Add item to cart
router.post("/:productId/add", 
  isLoggedIn, 
  sanitizeInput,
  validateInput(addToCartSchema),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity = 1 } = req.body;
      const userId = req.user._id;

      // Validate product ID
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        req.flash("error", "Invalid product ID");
        return res.redirect("/products");
      }

      // Check if product exists and has stock
      const product = await Product.findById(productId);
      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/products");
      }

      if (product.stock < quantity) {
        req.flash("error", "Not enough stock available");
        return res.redirect(`/products/${productId}`);
      }

      // Get user and check if product already in cart
      const user = await User.findById(userId);
      const existingItem = user.cart.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + parseInt(quantity);
        if (newQuantity > product.stock) {
          req.flash("error", "Not enough stock available");
          return res.redirect(`/products/${productId}`);
        }
        existingItem.quantity = newQuantity;
      } else {
        // Add new item to cart
        user.cart.push({
          product: productId,
          quantity: parseInt(quantity)
        });
      }

      await user.save();
      req.flash("success", "Item added to cart successfully");
      res.redirect("/cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      req.flash("error", "Failed to add item to cart");
      res.redirect("/products");
    }
  }
);

// Update cart item quantity
router.patch("/:productId", 
  isLoggedIn, 
  sanitizeInput,
  validateInput(updateCartSchema),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user._id;

      // Validate product ID
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Check product stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ error: "Not enough stock available" });
      }

      // Update cart item
      const user = await User.findById(userId);
      const cartItem = user.cart.find(item => 
        item.product.toString() === productId
      );

      if (!cartItem) {
        return res.status(404).json({ error: "Item not found in cart" });
      }

      cartItem.quantity = parseInt(quantity);
      await user.save();

      res.json({ 
        success: true, 
        message: "Cart updated successfully",
        quantity: cartItem.quantity
      });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ error: "Failed to update cart" });
    }
  }
);

// Remove item from cart
router.delete("/:productId", isLoggedIn, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate product ID
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Remove item from cart
    const user = await User.findById(userId);
    user.cart = user.cart.filter(item => 
      item.product.toString() !== productId
    );
    await user.save();

    res.json({ 
      success: true, 
      message: "Item removed from cart successfully" 
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// Clear entire cart
router.delete("/", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    user.cart = [];
    await user.save();

    req.flash("success", "Cart cleared successfully");
    res.redirect("/cart");
  } catch (error) {
    console.error("Clear cart error:", error);
    req.flash("error", "Failed to clear cart");
    res.redirect("/cart");
  }
});

// Get cart count (for API)
router.get("/count", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const itemCount = user.cart.reduce((total, item) => total + item.quantity, 0);
    
    res.json({ count: itemCount });
  } catch (error) {
    console.error("Cart count error:", error);
    res.status(500).json({ error: "Failed to get cart count" });
  }
});

// Checkout page
router.get("/checkout", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: "cart.product",
        select: "name price img stock"
      });

    if (!user || user.cart.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    // Calculate totals
    let totalAmount = 0;
    const cartItems = [];

    for (const item of user.cart) {
      if (item.product) {
        const itemTotal = item.product.price * item.quantity;
        totalAmount += itemTotal;
        cartItems.push({
          product: item.product,
          quantity: item.quantity,
          total: itemTotal
        });
      }
    }

    res.render("cart/checkout", {
      cartItems,
      totalAmount: totalAmount.toFixed(2),
      title: "Checkout - Shopiko"
    });
  } catch (error) {
    console.error("Checkout error:", error);
    req.flash("error", "Failed to load checkout page");
    res.redirect("/cart");
  }
});

module.exports = router; 