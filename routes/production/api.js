const express = require("express");
const { isLoggedIn } = require("../../middlewares");
const { validateInput, sanitizeInput } = require("../../middlewares/security");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Review = require("../../models/Review");
const Joi = require("joi");
const router = express.Router();

// Validation schemas
const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(500).required(),
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  category: Joi.string().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  sortBy: Joi.string().valid('price', 'name', 'rating', 'createdAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
});

// Like/Unlike product
router.post("/products/:productId/like", isLoggedIn, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate product ID
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await User.findById(userId);
    const isLiked = user.wishlist.includes(productId);

    if (isLiked) {
      // Remove from wishlist
      await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: productId }
      });
      res.json({ 
        success: true, 
        message: "Product removed from wishlist",
        liked: false 
      });
    } else {
      // Add to wishlist
      await User.findByIdAndUpdate(userId, {
        $addToSet: { wishlist: productId }
      });
      res.json({ 
        success: true, 
        message: "Product added to wishlist",
        liked: true 
      });
    }
  } catch (error) {
    console.error("Like product error:", error);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

// Get user wishlist
router.get("/wishlist", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: "wishlist",
        select: "name price img desc category"
      });

    res.json({
      success: true,
      wishlist: user.wishlist,
      count: user.wishlist.length
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// Add review to product
router.post("/products/:productId/reviews", 
  isLoggedIn, 
  sanitizeInput,
  validateInput(reviewSchema),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      // Validate product ID
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        author: userId,
        product: productId
      });

      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this product" });
      }

      // Create new review
      const review = new Review({
        rating,
        comment,
        author: userId,
        product: productId
      });

      await review.save();

      // Add review to product
      product.reviews.push(review._id);
      await product.save();

      // Populate review with author info
      await review.populate('author', 'username');

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        review
      });
    } catch (error) {
      console.error("Add review error:", error);
      res.status(500).json({ error: "Failed to add review" });
    }
  }
);

// Get product reviews
router.get("/products/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate product ID
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

// Search products
router.get("/search", 
  sanitizeInput,
  validateInput(searchSchema),
  async (req, res) => {
    try {
      const { 
        q, 
        category, 
        minPrice, 
        maxPrice, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        page = 1,
        limit = 12
      } = req.query;

      // Build filter object
      const filter = {};
      
      // Search query
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { desc: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ];
      }

      // Category filter
      if (category) {
        filter.category = category;
      }

      // Price filter
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('author', 'username'),
        Product.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          query: q,
          category,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder
        }
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  }
);

// Get product categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      categories: categories.filter(cat => cat), // Remove null/undefined
      categoryCounts
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
});

// Get product statistics
router.get("/stats", async (req, res) => {
  try {
    const [totalProducts, totalUsers, avgPrice, categories] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Product.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
      ]),
      Product.distinct('category')
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        avgPrice: avgPrice[0]?.avgPrice || 0,
        totalCategories: categories.filter(cat => cat).length
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router; 