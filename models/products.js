const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Product Name should not exceed 100 characters"],
  },
  price: {
    type: Number,
    required: true,
    default: 0.0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  // category:{
  //     type:String,
  //     required:[true, 'Please select category of product'],
  //     enum:{
  //         values:[
  //             'Cameras',
  //             'Electronics',
  //             'Clothes',
  //             'Headphones'
  //         ],
  //         message:"Please select correct category for this product"
  //     }
  // }
  seller: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user:{
        type: mongoose.Schema.Types.ObjectId, 
        // required:true,
        ref:'user',
      },
      name: {
        type: String,
        // required: true,
      },
      rating: {
        type: Number,
        // required: true,
      },
      comment: {
        type: String,
        // required: true,
      },
    },
  ],
  user:{
    type: mongoose.Schema.Types.ObjectId, 
    // required:true,
    ref:'user',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
