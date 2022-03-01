const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  cartItems: [
    {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      images: {
        type: String,
        required: false,
      },
    },
  ],
  productList: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  totalPrice: {
    type: Number,
    default: 0,
    required: false,
  },

  orderStatus: {
    type: String,

    default: "Processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: Date,
});

module.exports = mongoose.model("Order", OrderSchema);
