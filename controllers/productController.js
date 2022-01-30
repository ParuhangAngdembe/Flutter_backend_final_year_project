const asyncErrorWrapper = require("../middleware/catchAsyncErrors");
const Product = require("../models/productSchema");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errohandler");

const getAllProducts = asyncErrorWrapper(async (req, res) => {
  // empty object means no filter and get all the products
  const resultPerPage = 8;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeature.query;

  res.status(200).json({ success: true, products, productCount });
});

const getProductDetails = asyncErrorWrapper(async (req, res, next) => {
  const { id: productID } = req.params;
  const product = await Product.findById({ _id: productID });

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

const createProducts = asyncErrorWrapper(async (req, res) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(200).json({ product });
});

const updateProducts = asyncErrorWrapper(async (req, res, next) => {
  //  Destructuring req.params = {}
  const { id: productID } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ product });
});

const deleteProducts = asyncErrorWrapper(async (req, res, next) => {
  const { id: productID } = req.params;
  const product = await Product.findOneAndDelete({ _id: productID });

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ product });
});

// New Review or Update Review
const getProductReviews = asyncErrorWrapper(async (req, res, next) => {
  const { productID } = req.query;
  const product = await Product.findById({ _id: productID });

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const review = product.reviews;
  // console.log(review);

  res.status(200).json({
    success: true,
    reviews: review,
  });
});

const createProductReview = asyncErrorWrapper(async (req, res, next) => {
  const { rating, comment, productID } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productID);
  const isReviewed = product.reviews.find((rev) => {
    return rev.user.toString() === req.user._id.toString();
  });
  // review bhitra ko user ko id === logged in user ko ID

  if (isReviewed) {
    // loop runs for each rev..
    product.reviews.forEach((rev) => {
      // to find out if its for the same review
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.noOfReviews = product.reviews.length;
    // appends new elements to the end of an array, and returns the new length of the array
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

const deleteReview = asyncErrorWrapper(async (req, res, next) => {
  const product = await Product.findById(req.query.productID);
  // // product.reviews.find;
  // console.log(req.query);
  // console.log(req.query.review);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  // Delete...
  await product.reviews.pull({ _id: req.query.reviewID });

  //Then... Save
  const reviews = product.reviews;
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = avg / reviews.length;
  const noOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productID,
    {
      reviews,
      ratings,
      noOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

module.exports = {
  getAllProducts,
  getProductDetails,
  createProducts,
  updateProducts,
  deleteProducts,
  getProductReviews,
  createProductReview,
  deleteReview,
};
