const mongoose = require("mongoose");
const HttpException = require("../exceptions/HttpException");
const OrderModel = require("../models/orders.model");
const AddressModel = require("../models/address.model");
const ProductModel = require("../models/product.model");

const OrderServices = {
  calculateOrderTotals: async (products, usedWalletAmount, userId) => {
    let calculatedTotal = 0;
    const formattedProducts = [];

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new HttpException(400, "Cart is empty");
    }

    for (const item of products) {
      const productDoc = await ProductModel.findById(item.product);
      if (!productDoc) {
        throw new HttpException(404, `Product not found: ${item.product}`);
      }
      const price = productDoc.price;
      const quantity = item.quantity || 1;

      if (productDoc.stock < quantity) {
        throw new HttpException(
          400,
          `Insufficient stock for "${productDoc.title}". Available: ${productDoc.stock}, Requested: ${quantity}`
        );
      }

      calculatedTotal += price * quantity;
      
      formattedProducts.push({
        product: productDoc._id,
        quantity: quantity,
        priceAtPurchase: price
      });
    }

    if (calculatedTotal < 500) {
      throw new HttpException(400, "Minimum order value is ₹500.");
    }

    let finalWalletDeduction = 0;
    if (usedWalletAmount > 0) {
      const UserModel = require("../models/user.model");
      const userDoc = await UserModel.findById(userId);
      if (!userDoc || userDoc.walletBalance < usedWalletAmount) {
        throw new HttpException(400, "Insufficient wallet balance");
      }
      finalWalletDeduction = Math.min(calculatedTotal, usedWalletAmount);
    }

    const payableAmount = Math.max(0, calculatedTotal - finalWalletDeduction);

    return {
      calculatedTotal,
      payableAmount,
      formattedProducts,
      finalWalletDeduction
    };
  },

  createOrderService: async (data, userId) => {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

      if (!isValidObjectId) {
        throw new HttpException(400, "Please provide a valid user id");
      }

      if (!data.deliveryAddress) {
        const address = await AddressModel.findOne({ default: true });
        data = { ...data, deliveryAddress: address };
      }

      // Securely calculate totals on the server
      const { 
        calculatedTotal, 
        payableAmount, 
        formattedProducts, 
        finalWalletDeduction 
      } = await OrderServices.calculateOrderTotals(data.products, data.usedWalletAmount, userId);

      // Verify Razorpay Payment if amount > 0
      if (payableAmount > 0) {
        if (!data.razorpay_order_id || !data.razorpay_payment_id || !data.razorpay_signature) {
          throw new HttpException(400, "Payment verification details are missing.");
        }
        const PaymentServices = require("./payment.service");
        await PaymentServices.verifyRazorpaySignature(
          data.razorpay_order_id, 
          data.razorpay_payment_id, 
          data.razorpay_signature
        );
      }

      data.products = formattedProducts;
      data.total = calculatedTotal;
      // Handle wallet points deduction
      if (finalWalletDeduction > 0) {
        const UserModel = require("../models/user.model");
        const userDoc = await UserModel.findById(userId);
        userDoc.walletBalance -= finalWalletDeduction;
        await userDoc.save();
      }

      const orderData = { ...data, user: userId };
      if (data.razorpay_payment_id) {
        orderData.razorpayPaymentId = data.razorpay_payment_id;
      }

      const order = new OrderModel(orderData);
      await order.save();

      // Deduct stock for all ordered items
      if (data.products && Array.isArray(data.products)) {
        for (const item of data.products) {
          await ProductModel.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      }

      return order;
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = [];

        for (const key in error.errors) {
          validationErrors.push(error.errors[key].message);
        }

        const errorMessage = `Validation error: ${validationErrors.join(", ")}`;

        throw new HttpException(400, errorMessage);
      } else if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error creating order");
      }
    }
  },
  getAllOrdersService: async () => {
    try {
      const orders = await OrderModel.find({ checkedOut: true })
        .populate("user")
        .populate("products.product")
        .populate("deliveryAddress")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error fetching all orders");
      }
    }
  },
  getUserOrderServices: async (userId) => {
    try {
      const orders = await OrderModel.find({ user: userId, checkedOut: true })
        .populate("user")
        .populate("products.product")
        .populate("deliveryAddress")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error adding address");
      }
    }
  },
  getOrderByIdServices: async (orderId) => {
    try {
      const order = await OrderModel.findById(orderId)
        .populate("user")
        .populate("products.product")
        .populate("deliveryAddress");

      return order;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error fetching order details");
      }
    }
  },

  updateOrderByIdService: async (orderId, changes) => {
    try {
      const oldOrder = await OrderModel.findById(orderId);
      if (!oldOrder) {
        throw new HttpException(404, "Order not found");
      }

      // If updating status to CANCELLED, restore stock
      if (changes.status === "CANCELLED" && oldOrder.status !== "CANCELLED") {
        if (oldOrder.products && Array.isArray(oldOrder.products)) {
          for (const item of oldOrder.products) {
            const prodId = item.product?._id || item.product;
            if (prodId) {
              await ProductModel.findByIdAndUpdate(prodId, {
                $inc: { stock: item.quantity }
              });
            }
          }
        }
      }

      const order = await OrderModel.findByIdAndUpdate(orderId, changes, {
        new: true,
      })
        .populate("user")
        .populate("products.product")
        .populate("deliveryAddress");

      if (changes.status === "SHIPPED") {
        try {
          const DeliveryServices = require("./delivery.service");
          await DeliveryServices.dispatchOrder(order);
        } catch (dispatchError) {
          console.error("Failed to dispatch delivery:", dispatchError);
        }
      }

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error updating order details");
      }
    }
  },
  cancelOrderService: async (orderId, userId) => {
    try {
      const order = await OrderModel.findOne({ _id: orderId, user: userId });
      if (!order) {
        throw new HttpException(404, "Order not found");
      }
      if (order.status !== "PENDING" && order.status !== "PROCESSING") {
        throw new HttpException(400, "Order cannot be cancelled at this stage");
      }

      if (order.status !== "CANCELLED") {
        order.status = "CANCELLED";
        await order.save();

        // Restore stock for cancelled items
        if (order.products && Array.isArray(order.products)) {
          for (const item of order.products) {
            const prodId = item.product?._id || item.product;
            if (prodId) {
              await ProductModel.findByIdAndUpdate(prodId, {
                $inc: { stock: item.quantity }
              });
            }
          }
        }
      }

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error cancelling order");
      }
    }
  },

  refundOrderService: async (orderId, refundMethod) => {
    try {
      const order = await OrderModel.findById(orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }
      if (order.status !== "CANCELLED" && order.status !== "RETURNED" && order.status !== "DELIVERED") {
        throw new HttpException(400, "Order must be CANCELLED or RETURNED to initiate a refund");
      }
      if (order.refundStatus !== "NONE") {
        throw new HttpException(400, "Order is already refunded");
      }

      if (refundMethod === "WALLET") {
        const UserModel = require("../models/user.model");
        const userDoc = await UserModel.findById(order.user);
        if (userDoc) {
          userDoc.walletBalance = (userDoc.walletBalance || 0) + order.total;
          await userDoc.save();
        }
        order.refundStatus = "REFUNDED_WALLET";
        order.status = "REFUNDED";
        await order.save();
      } else if (refundMethod === "BANK") {
        if (order.razorpayPaymentId) {
          const PaymentServices = require("./payment.service");
          await PaymentServices.refundPayment(order.razorpayPaymentId, order.total);
        }
        order.refundStatus = "REFUNDED_BANK";
        order.status = "REFUNDED";
        await order.save();
      } else {
        throw new HttpException(400, "Invalid refund method");
      }

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error processing refund");
      }
    }
  },
};

module.exports = OrderServices;

