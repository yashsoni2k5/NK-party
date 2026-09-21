const mongoose = require("mongoose");
const HttpException = require("../exceptions/HttpException");
const ReplacementModel = require("../models/replacement.model");
const OrderModel = require("../models/orders.model");

const ReplacementServices = {
  createReplacementRequest: async (userId, data) => {
    try {
      const order = await OrderModel.findOne({ _id: data.orderId, user: userId });
      if (!order) {
        throw new HttpException(404, "Order not found");
      }
      
      const newRequest = new ReplacementModel({
        order: data.orderId,
        user: userId,
        product: data.productId,
        reason: data.reason,
        damageImageUrl: data.damageImageUrl,
      });

      await newRequest.save();

      order.status = "REPLACEMENT_REQUESTED";
      await order.save();

      return newRequest;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error creating replacement request");
    }
  },

  getAllReplacements: async () => {
    try {
      return await ReplacementModel.find()
        .populate("user")
        .populate("product")
        .populate("order")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new HttpException(500, "Error fetching replacements");
    }
  },

  updateReplacementStatus: async (requestId, status) => {
    try {
      const request = await ReplacementModel.findByIdAndUpdate(
        requestId,
        { status },
        { new: true }
      );
      
      if (!request) throw new HttpException(404, "Request not found");

      if (status === "REPLACED") {
        const order = await OrderModel.findById(request.order);
        if (order) {
          order.status = "REPLACED";
          await order.save();
        }
      }

      return request;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error updating request");
    }
  }
};

module.exports = ReplacementServices;
