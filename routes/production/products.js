const express = require("express");
const Product = require("../../models/Product");
const Review = require("../../models/Review");
const { validateInput, sanitizeInput } = require("../../middlewares/security");
const { isLoggedIn, isSeller, isProductAuthor } = require("../../middlewares");
const Joi = require("joi");
const router = express.Router();

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  desc: Joi.string().min(10).max(1000).required(),
  img: Joi.string().uri().required(),
  category: Joi.string().optional(),
  stock: Joi.number().integer().min(0).default(0),
});

// Get all products with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username'),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render("products/index", {
      products,
      currentPage: page,
      totalPages,
      totalProducts: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      title: "Products - Shopiko"
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    req.flash("error", "Failed to load products");
    res.redirect("/");
  }
});

// Get product creation form
router.get("/new", isLoggedIn, isSeller, (req, res) => {
  res.render("products/new", {
    title: "Add Product - Shopiko"
  });
});

// Create new product
router.post("/", 
  isLoggedIn, 
  isSeller, 
  sanitizeInput,
  validateInput(productSchema),
  async (req, res) => {
    try {
      const { name, img, price, desc, category, stock } = req.body;
      
      const product = new Product({
        name,
        img,
        price: parseFloat(price),
        desc,
        category,
        stock: parseInt(stock) || 0,
        author: req.user._id
      });

      await product.save();
      
      req.flash("success", "Product added successfully");
      res.redirect(`/products/${product._id}`);
    } catch (error) {
      console.error("Product creation error:", error);
      req.flash("error", "Failed to create product");
      res.redirect("/products/new");
    }
  }
);

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid product ID");
      return res.redirect("/products");
    }

    const product = await Product.findById(id)
      .populate('reviews')
      .populate('author', 'username');

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    res.render("products/show", {
      product,
      title: `${product.name} - Shopiko`
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    req.flash("error", "Failed to load product");
    res.redirect("/products");
  }
});

// Get product edit form
router.get("/:id/edit", isLoggedIn, isSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    if (!isProductAuthor(req, res, product)) {
      req.flash("error", "You don't have permission to edit this product");
      return res.redirect(`/products/${id}`);
    }

    res.render("products/edit", {
      product,
      title: `Edit ${product.name} - Shopiko`
    });
  } catch (error) {
    console.error("Product edit error:", error);
    req.flash("error", "Failed to load product for editing");
    res.redirect("/products");
  }
});

// Update product
router.patch("/:id",
  isLoggedIn,
  isSeller,
  sanitizeInput,
  validateInput(productSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, img, price, desc, category, stock } = req.body;

      const product = await Product.findById(id);
      
      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/products");
      }

      if (!isProductAuthor(req, res, product)) {
        req.flash("error", "You don't have permission to edit this product");
        return res.redirect(`/products/${id}`);
      }

      await Product.findByIdAndUpdate(id, {
        name,
        img,
        price: parseFloat(price),
        desc,
        category,
        stock: parseInt(stock) || 0
      });

      req.flash("success", "Product updated successfully");
      res.redirect(`/products/${id}`);
    } catch (error) {
      console.error("Product update error:", error);
      req.flash("error", "Failed to update product");
      res.redirect(`/products/${req.params.id}/edit`);
    }
  }
);

// Delete product
router.delete("/:id", isLoggedIn, isSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    if (!isProductAuthor(req, res, product)) {
      req.flash("error", "You don't have permission to delete this product");
      return res.redirect(`/products/${id}`);
    }

    // Delete associated reviews
    await Review.deleteMany({ _id: { $in: product.reviews } });
    
    // Delete the product
    await Product.findByIdAndDelete(id);

    req.flash("success", "Product deleted successfully");
    res.redirect("/products");
  } catch (error) {
    console.error("Product deletion error:", error);
    req.flash("error", "Failed to delete product");
    res.redirect(`/products/${req.params.id}`);
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ category })
        .populate('author', 'username')
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ category })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render("products/category", {
      products,
      category,
      currentPage: page,
      totalPages,
      totalProducts: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      title: `${category} Products - Shopiko`
    });
  } catch (error) {
    console.error("Category products error:", error);
    req.flash("error", "Failed to load category products");
    res.redirect("/products");
  }
});

module.exports = router; 