const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // this imports your above schema

router.get('/products', async (req, res) => {
    const { category } = req.query;
    let filter = {};

    if (category && category !== 'All') {
        filter.category = category;
    }

    const products = await Product.find(filter);
    const categories = await Product.distinct('category');

    res.render('products/index', {
        products,
        categories,
        selectedCategory: category || 'All'
    });
});

module.exports = router;
