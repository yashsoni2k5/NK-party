const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "please provide a title"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
    },
    tag: {
      type: [String],
      required: [true, "please provide tag"],
    },
    image: {
      type: String,
      required: [true, "please provide product image"],
    },
    price: {
      type: Number,
      required: [true, "please provide product price"],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    itemType: {
      type: String,
      enum: ["PRODUCT", "SERVICE"],
      default: "PRODUCT",
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

const ProductModel = mongoose.model("products", productSchema);

module.exports = ProductModel;
