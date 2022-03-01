const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 20,
    required: [true, "product name must be provided"],
  },
  price: {
    type: Number,
    required: [true, "Enter Price"],
    maxlength: [8, "Should not exceed 8 figures"],
  },
  description: {
    type: String,
    required: [true, "Please enter Descriptioin"],
  },

  images: { type: String },
  // images: [
  //   {
  //     public_id: {
  //       type: String,
  //       required: true,
  //     },
  //     url: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  category: {
    type: String,
    required: [true, "enter category"],
  },
  stock: {
    type: Number,
    required: [true, "enter stock"],
    maxlength: [4, "Stock cannot exceed 4 digit"],
  },

  // Needed to see who made the product
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// const categorySchema = new mongoose.Schema({});

// const brandSchema = new mongoose.Schema({});

module.exports = mongoose.model("Product", ProductSchema);
