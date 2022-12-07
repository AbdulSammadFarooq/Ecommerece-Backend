const res = require("express/lib/response");
const Product = require("../models/products");
const cloudinary = require("cloudinary")

// display all products
exports.getAllProducts = async (req, res) => {
  try {
    if (Object.keys(req.query)?.length) {
      if (req.query?.name) {
        const products = await Product.find({
          name: { $regex: new RegExp(req.query?.name, "i") },
        });
        if (products?.length) {
          return res.json({
            success: true,
            message: "Data found successfully",
            data: products,
          });
        }
        return res.json({ success: false, message: "No data found" });
      } else if (req.query?.price) {
        const products = await Product.find({ price: req.query?.price });
        if (products?.length) {
          return res.json({
            success: true,
            message: "Data found successfully",
            data: products,
          });
        }
        return res.json({ success: false, message: "No data found" });
      } else if (req.query?.limit && req.query?.page) {
        const resPerPage = 8;
        const product = await Product.find({})
          .limit(req.query?.limit * 1)
          .skip((req.quey?.page - 1) * req.query?.limit);
        if (product?.length) {
          const count = await Product.countDocuments();
          return res.json({
            success: true,
            message: "Paginated data found successfully",
            currentPage: req.query?.page,
            totalPages: Math.ceil(count / req.query?.limit),
            resPerPage,
            data: product,
          });
        }
        return res.json({ success: false, message: "No data found" });
      }
      return res.json({
        success: false,
        message: "Wrong query parameters. Parameters shoud be price or name",
      });
    }
    const products = await Product.find({}).sort({createdAt:-1});
    if (products?.length) {
      const productsCount = await Product.countDocuments();


      return res.status(200).json({
        success: true,
        message: "All products are found here!",
        products,
        productsCount
      });

    }
    // return res.status(201).json({ success: false, message: "No data found" }); 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some internal server error",
    });
  }
};

// get all admin products
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length) {
      return res.json({ success: true, message: "Products found successfully", products: products })
    }
    return res.json({ success: false, message: "Products not found", products: [] })
  }
  catch (error) {
    return res.json({ success: false, message: "Something went wrong" })
  }
}

//  get pagination
exports.getPaginatedData = async (req, res) => {
  const { page, limit } = req.query;
  if (!req.query?.page || !req.query?.limit) {
    return res.json({ success: false, message: "page and limit is required" });
  }
  const product = await Product.find({})
    .limit(limit * 1)
    .skip((page - 1) * limit);
  if (product?.length) {
    const count = await Product.countDocuments();
    return res.json({
      success: true,
      message: "Paginated data found successfully",
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      data: product,
    });
  }
  return res.json({ success: false, message: "No data found" });
};

// get single product
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "No product found" });
    }
    return res.status(200).json({
      success: true,
      message: "Product found successfully",
      productDetails: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some internal error occur",
      error: error,
    });
  }
};

// add new Product
exports.addProducts = async (req, res) => {
  try {
    let images = [];
    if (typeof req.body.images === "string"){
      images.push(req.body.images)
    }else{
      images = req.body.images
    }

    let imagesLink = []
    for (let i=0; i<images?.length; i++){
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder:"products"
      });
      imagesLink.push({
        public_id : result?.public_id,
        url: result?.secure_url
      })
    }
    req.body.user = req.user?.id;
    const product = new Product({
      name:req.body?.name,
      price:req.body?.price,
      stock:req.body?.stock,
      seller: req.body?.seller,
      description: req.body?.description,
      images: imagesLink,

    });
    await product.save();
    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some Internal server error",
    });
  }
};

// update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "No product found" });
    }
    const update = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      productDetails: update,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some internal server error",
      error: error,
    });
  }
};

// delete product
exports.deleteProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "No product found to delete" });
    }
    product = await Product.findByIdAndDelete(req.params.id);
    for (let i =0; i<product?.images?.length; i++){
      await cloudinary.v2.uploader.destroy(product.images[i]?.public_id)
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some internal server error",
    });
  }
};

// product reviews
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    
    if (isReviewed) {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user._id.toString()) {
          review.comment = comment;
          review.rating = rating;
        }
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }
    let totalRating = 0
    for (let i=0; i< product?.reviews?.length; i++){
      totalRating = totalRating + product?.reviews[i]?.rating
    }

    product.rating =totalRating / product?.reviews?.length
    // product.ratings =
    //   product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    //   product.reviews.length;
    await product.save({ validateBeforeSave: false });
    return res.json({ success: true });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some internal server error occurr",
    });
  }
};
  
// product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.json({
        success: false,
        message: "No product with this id is found",
      });
    }
    return res.json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some internal server error occur",
      error: error,
    });
  }
};

// delete reviews
exports.deleteProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);
    const reviews = product.reviews.filter(
      (review) => review._id.toString() !== req.query.id.toString()
    );
    const numOfReviews = reviews.length;
    const ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      reviews.length;
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    return res.json({
      success: true
    })
  } catch (error) {
    return res.json({
      success: false,
      message: "Some internal server error occur",
      error: error,
    });
  }
};
