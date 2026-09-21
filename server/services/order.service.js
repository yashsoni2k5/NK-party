const mongoose = require("mongoose");
const HttpException = require("../exceptions/HttpException");
const OrderModel = require("../models/orders.model");
const AddressModel = require("../models/address.model");
const ProductModel = require("../models/product.model");

const OrderServices = {
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

      // Fetch prices for each product to prevent price spoofing
      if (data.products && Array.isArray(data.products)) {
        let calculatedTotal = 0;
        const formattedProducts = [];

        for (const item of data.products) {
          const productDoc = await ProductModel.findById(item.product);
          if (!productDoc) {
            throw new HttpException(404, `Product not found: ${item.product}`);
          }
          const price = productDoc.price;
          const quantity = item.quantity || 1;
          calculatedTotal += price * quantity;
          
          formattedProducts.push({
            product: productDoc._id,
            quantity: quantity,
            priceAtPurchase: price
          });
        }
        
        data.products = formattedProducts;
        data.total = calculatedTotal;
      }

      if (!data.total || data.total < 500) {
        throw new HttpException(400, "Minimum order value is ₹500. Please add more products to continue.");
      }

      const order = new OrderModel({ ...data, user: userId });
      await order.save();
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
      order.status = "CANCELLED";
      await order.save();
      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error cancelling order");
      }
    }
  },
};

module.exports = OrderServices;
