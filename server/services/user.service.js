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
      const { mobile, email, password, name } = registrationDetails;
      
      if (!name || name.trim().length === 0) {
        throw new HttpException(400, "Please provide a valid name");
      }

      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        throw new HttpException(400, "Please provide a valid 10-digit Indian mobile number");
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpException(400, "Please provide a valid email address");
      }

      if (!password || password.length < 6) {
        throw new HttpException(400, "Password must be at least 6 characters long");
      }

      const existingUser = await UserModel.findOne({ $or: [{ mobile }, { email }] });
      if (existingUser) {
        throw new HttpException(409, "User already registered, please login");
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
        throw new HttpException(400, "Please provide mobile number and password");
      }

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw new HttpException(400, "Please provide a valid 10-digit mobile number");
      }

      const user = await UserModel.findOne({ mobile });
      if (!user) {
        throw new HttpException(401, "Invalid mobile number or password");
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

  getAllUsersService: async () => {
    try {
      const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
      return users;
    } catch (error) {
      throw new HttpException(500, "Error fetching all users");
    }
  },

  forgotPasswordService: async (identifier) => {
    try {
      if (!identifier || identifier.trim().length === 0) {
        throw new HttpException(400, "Please provide registered email or mobile number");
      }

      const user = await UserModel.findOne({
        $or: [{ email: identifier.trim() }, { mobile: identifier.trim() }]
      });

      if (!user) {
        throw new HttpException(404, "No user account found with that email or mobile number");
      }

      // Generate 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = expiresAt;
      await user.save();

      return {
        success: true,
        message: "Reset OTP generated successfully. Valid for 15 minutes.",
        otp: otp // Included for easy verification/testing in development
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error processing forgot password request");
    }
  },

  resetPasswordService: async ({ identifier, otp, newPassword }) => {
    try {
      if (!identifier || !otp || !newPassword) {
        throw new HttpException(400, "Please provide email/mobile, OTP, and new password");
      }

      if (newPassword.length < 6) {
        throw new HttpException(400, "New password must be at least 6 characters long");
      }

      const user = await UserModel.findOne({
        $or: [{ email: identifier.trim() }, { mobile: identifier.trim() }]
      });

      if (!user) {
        throw new HttpException(404, "User account not found");
      }

      if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp.toString().trim()) {
        throw new HttpException(400, "Invalid or incorrect OTP");
      }

      if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
        throw new HttpException(400, "OTP has expired. Please request a new one.");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordOTP = null;
      user.resetPasswordExpires = null;
      await user.save();

      return {
        success: true,
        message: "Password reset successfully! Please login with your new password."
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error resetting password");
    }
  },
};

module.exports = UserServices;
