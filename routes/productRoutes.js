// productRoutes.js
const express = require('express');
const Product = require('../models/Product');
const Review = require('../models/Review');
const router = express.Router();
const { validateProduct, isLoggedIn, isSeller, isProductAuthor } = require('../middlewares');

// ✅ Display all products with optional category filter
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let products;

    if (category && category !== 'All') {
      products = await Product.find({ category });
    } else {
      products = await Product.find({});
    }

    const categories = await Product.distinct('category');

    res.render('products/index', {
      products,
      categories,
      selectedCategory: category || 'All'  // ✅ Fixed to match EJS usage
    });
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

// ✅ Route - View products by category with search
router.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const searchQuery = req.query.search || "";

    let products;

    if (searchQuery) {
      products = await Product.find({
        category: categoryName,
        name: { $regex: searchQuery, $options: "i" }
      });
    } else {
      products = await Product.find({ category: categoryName });
    }

    res.render("products/categoryProducts", {
      category: categoryName,
      products,
      searchQuery
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load products in this category");
    res.redirect("/products");
  }
});

// ✅ New product form
router.get('/products/new', isLoggedIn, isSeller, (req, res) => {
  try {
    res.render('products/new');
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

// ✅ Create product
router.post('/products', isLoggedIn, isSeller, validateProduct, async (req, res) => {
  try {
    const { name, img, price, desc, category } = req.body;
    await Product.create({ name, img, price, desc, category, author: req.user._id });
    req.flash('success', 'Product added successfully');
    res.redirect('/products');
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

// ✅ Show product details
router.get('/products/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const foundProduct = await Product.findById(id).populate('reviews');
    res.render('products/show', { foundProduct, msg: req.flash('msg') });
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

// ✅ Edit product form
router.get('/products/:id/edit', isLoggedIn, isSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render('products/edit', { foundProduct });
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

// ✅ Update product
router.patch('/products/:id', isLoggedIn, isSeller, isProductAuthor, validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, img, price, desc, category } = req.body;
    await Product.findByIdAndUpdate(id, { name, img, price, desc, category });
    req.flash('success', 'Product edited successfully');
    res.redirect(`/products/${id}`);
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

// ✅ Delete product
router.delete('/products/:id', isLoggedIn, isSeller, isProductAuthor, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    for (let reviewId of product.reviews) {
      await Review.findByIdAndDelete(reviewId);
    }
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Product deleted successfully');
    res.redirect('/products');
  } catch (e) {
    res.status(500).render('error', { err: e.message });
  }
});

module.exports = router;
