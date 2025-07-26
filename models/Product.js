const mongoose = require('mongoose');
const Review = require('./Review');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    image: {
        type: String,
        trim: true
    },
    img: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    rating: {
        type: Number
    },
    istock: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
