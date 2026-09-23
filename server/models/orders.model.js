const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "please provide a user id"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: [true, "please provide a product id"],
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
      },
    ],
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
    total: {
      type: Number,
      required: [true, "please provide total price"],
    },
    checkedOut: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    refundStatus: {
      type: String,
      enum: ["NONE", "REFUNDED_BANK", "REFUNDED_WALLET"],
      default: "NONE",
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
