const Order = require("../models/orderModel");
const Product = require("../models/productSchema");
const ErrorHandler = require("../utils/errohandler");
const asyncErrorWrapper = require("../middleware/catchAsyncErrors");

// Create New Order
const createOrder = asyncErrorWrapper(async (req, res, next) => {
  console.log(req.body);
  const { cartItems, totalPrice } = req.body;
  // console.log( req.body);
  // var deco = jsonDecode(cartItems);
  // console.log(deco);

  // console.log(`order length: ${orderItems.length}, orderitems: ${orderItems}`);

  var productList = [];
  for (var i = 0; i < cartItems.length; i++) {
    var productId = cartItems[i].id;
    //  console.log(cartItems[i].name);
    var product = await Product.findById({ _id: productId });
    // console.log(product);
    productList.push({ product: product });
  }
  // console.log(productList);

  const order = await Order.create({
    cartItems,
    totalPrice,
    productList,
    paidAt: Date.now(),
    user: req.user._id,
  });
  // console.log(order);
  res.status(201).json({
    success: true,
    order,
  });
});

// Get Single Order
const getSingleOrder = asyncErrorWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    // Populate use garera we can choose what to populate our Order with, here we can populate with only user's name and email and dsicard the remainig properties
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", id));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

// Get All Orders -- Admin
const getAllOrder = asyncErrorWrapper(async (req, res, next) => {
  const orders = await Order.find({});

  let subTotal = 0;
  orders.forEach((order) => {
    subTotal += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    subTotal,
    orders,
  });
});

// Update Order
const updateOrder = asyncErrorWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Orders Found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Order Has Already Been Delivered", 400));
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    order,
  });
});
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  // console.log(product);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Delete Order
const deleteOrder = asyncErrorWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Orders Found", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

// Logged in User's Order
const myOrder = asyncErrorWrapper(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

module.exports = {
  createOrder,
  getSingleOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  myOrder,
};
