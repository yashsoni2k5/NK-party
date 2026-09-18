const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const HttpException = require("../exceptions/HttpException");
const UserModel = require("../models/user.model");

const UserServices = {
  getUserService: async (userId) => {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

      if (!isValidObjectId) {
        throw new HttpException(400, "Please provide a valid user id");
      }

      const user = await UserModel.findOne({ _id: userId }).select("-password");
      if (!user) {
        throw new HttpException(404, "No user found");
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error fetching user");
    }
  },

  registerUserService: async (registrationDetails) => {
    try {
      const { mobile, email, password } = registrationDetails;
      if (!password) {
        throw new HttpException(400, "Please provide a password");
      }

      const existingUser = await UserModel.findOne({ $or: [{ mobile }, { email }] });
      if (existingUser) {
        throw new HttpException(404, "User already registered please login");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        ...registrationDetails,
        password: hashedPassword,
      });

      await newUser.save();
      
      const token = jwt.sign({ userId: newUser._id }, process.env.jwtsecret || "your-secret-key");
      const userToReturn = newUser.toObject();
      delete userToReturn.password;

      return { token, user: userToReturn };
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw new HttpException(400, `Validation error: ${validationErrors.join(", ")}`);
      }
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error creating user");
    }
  },

  loginUserService: async (loginDetails) => {
    try {
      const { mobile, password } = loginDetails;
      if (!mobile || !password) {
        throw new HttpException(404, "Please provide mobile number and password");
      }

      const user = await UserModel.findOne({ mobile });
      if (!user) {
        throw new HttpException(404, "No registered user found please sign up");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException(400, "Invalid credentials");
      }

      const token = jwt.sign({ userId: user._id }, process.env.jwtsecret || "your-secret-key");
      const userToReturn = user.toObject();
      delete userToReturn.password;

      return { token, user: userToReturn };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error logging in");
    }
  },

  getCurrentUser: async (userId) => {
    try {
      const user = await UserModel.findById(userId).select("-password");
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error fetching current user");
    }
  },

  updateCurrentUser: async (userId, changes) => {
    try {
      if (changes.password) {
        const salt = await bcrypt.genSalt(10);
        changes.password = await bcrypt.hash(changes.password, salt);
      }
      const user = await UserModel.findByIdAndUpdate(userId, changes, { new: true }).select("-password");
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error updating current user");
    }
  },
};

module.exports = UserServices;
