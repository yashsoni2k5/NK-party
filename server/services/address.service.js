const mongoose = require("mongoose");
const HttpException = require("../exceptions/HttpException");
const AddressModel = require("../models/address.model");

const AddressServices = {
  createAddressService: async (data, userId) => {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

      if (!isValidObjectId) {
        throw new HttpException(400, "Please provide a valid user id");
      }
      await AddressModel.findOneAndUpdate(
        { default: true },
        { default: false }
      );
      const address = await AddressModel({
        ...data,
        user: userId,
        default: true,
      });
      await address.save();
      return address;
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
        throw new HttpException(500, "Error adding address");
      }
    }
  },
  getUserAddressService: async (userId) => {
    try {
      const address = await AddressModel.find({ user: userId });
      return address;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(500, "Error fetching address");
      }
    }
  },

  lookupPincodeService: async (pincode) => {
    try {
      const cleanPin = String(pincode || '').trim();
      if (!/^\d{6}$/.test(cleanPin)) {
        throw new HttpException(400, "Invalid 6-digit PIN code format");
      }

      const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      if (!response.ok) {
        throw new HttpException(502, "External Pincode Service Unavailable");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error looking up pincode");
    }
  },
};

module.exports = AddressServices;
