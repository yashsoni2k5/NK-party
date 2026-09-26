const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const HttpException = require("../exceptions/HttpException");
const UserModel = require("../models/user.model");
const EmailService = require("./email.service");

// Helper to generate a cryptographically secure 6-digit OTP
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

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
      
      // Generate secure OTP
      const otp = generateSecureOTP();
      const hashedOTP = await bcrypt.hash(otp, salt);
      const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

      const newUser = new UserModel({
        ...registrationDetails,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationOTP: hashedOTP,
        emailVerificationExpires: expiresAt,
        otpAttempts: 0,
        lastOtpSentAt: new Date()
      });

      await newUser.save();
      
      // Send the email
      await EmailService.sendVerificationEmail(email, name, otp, process.env.OTP_EXPIRY_MINUTES || 10);

      return { 
        success: true, 
        message: "Registration successful. Please verify your email.", 
        requiresVerification: true,
        email: email
      };
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw new HttpException(400, `Validation error: ${validationErrors.join(", ")}`);
      }
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error creating user");
    }
  },

  verifyEmailOTPService: async (email, otp) => {
    try {
      if (!email || !otp) {
        throw new HttpException(400, "Please provide email and OTP");
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      if (user.isEmailVerified) {
        throw new HttpException(400, "Email is already verified");
      }

      // Check max attempts
      const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
      if (user.otpAttempts >= maxAttempts) {
        user.emailVerificationOTP = null; // Invalidate
        await user.save();
        throw new HttpException(429, "Too many failed attempts. Please request a new OTP.");
      }

      // Check expiration
      if (!user.emailVerificationExpires || new Date() > new Date(user.emailVerificationExpires)) {
        throw new HttpException(400, "OTP has expired. Please request a new one.");
      }

      // Compare hash
      if (!user.emailVerificationOTP) {
        throw new HttpException(400, "No OTP requested");
      }

      const isMatch = await bcrypt.compare(otp.toString(), user.emailVerificationOTP);
      if (!isMatch) {
        user.otpAttempts += 1;
        await user.save();
        throw new HttpException(400, "Invalid OTP");
      }

      // Success
      user.isEmailVerified = true;
      user.emailVerificationOTP = null;
      user.emailVerificationExpires = null;
      user.otpAttempts = 0;
      await user.save();
      
      // Now login the user
      const token = jwt.sign(
        { userId: user._id }, 
        process.env.jwtsecret || "your-secret-key",
        { expiresIn: "7d" }
      );
      const userToReturn = user.toObject();
      delete userToReturn.password;

      return { success: true, message: "Email verified successfully!", token, user: userToReturn };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error verifying email OTP");
    }
  },

  resendEmailOTPService: async (email) => {
    try {
      if (!email) throw new HttpException(400, "Please provide an email");

      const user = await UserModel.findOne({ email });
      if (!user) throw new HttpException(404, "User not found");
      if (user.isEmailVerified) throw new HttpException(400, "Email is already verified");

      // Check cooldown
      const cooldownSeconds = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
      if (user.lastOtpSentAt && (new Date() - new Date(user.lastOtpSentAt)) < (cooldownSeconds * 1000)) {
        throw new HttpException(429, `Please wait before requesting another OTP.`);
      }

      const otp = generateSecureOTP();
      const salt = await bcrypt.genSalt(10);
      const hashedOTP = await bcrypt.hash(otp, salt);
      const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

      user.emailVerificationOTP = hashedOTP;
      user.emailVerificationExpires = expiresAt;
      user.otpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save();

      await EmailService.sendVerificationEmail(email, user.name, otp, process.env.OTP_EXPIRY_MINUTES || 10);

      return { success: true, message: "A new OTP has been sent to your email." };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error resending OTP");
    }
  },

  loginUserService: async (loginDetails) => {
    try {
      const { mobile, password } = loginDetails;
      if (!mobile || !password) {
        throw new HttpException(400, "Please provide mobile number and password");
      }

      const user = await UserModel.findOne({ mobile });
      if (!user) {
        throw new HttpException(401, "Invalid mobile number or password");
      }
      
      if (!user.isEmailVerified) {
         throw new HttpException(403, "Please verify your email before logging in.");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException(400, "Invalid credentials");
      }

      const token = jwt.sign(
        { userId: user._id }, 
        process.env.jwtsecret || "your-secret-key",
        { expiresIn: "7d" }
      );
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
        throw new HttpException(400, "Please provide a registered email");
      }

      // Check email instead of mobile to match forgot-password secure flow
      const user = await UserModel.findOne({ email: identifier.trim() });

      if (!user) {
        // Prevent email enumeration by giving generic response
        return {
          success: true,
          message: "If an account exists with this email, a password reset OTP has been sent."
        };
      }
      
      // Cooldown check for password reset OTP
      const cooldownSeconds = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
      if (user.lastOtpSentAt && (new Date() - new Date(user.lastOtpSentAt)) < (cooldownSeconds * 1000)) {
        throw new HttpException(429, `Please wait before requesting another OTP.`);
      }

      const otp = generateSecureOTP();
      const salt = await bcrypt.genSalt(10);
      const hashedOTP = await bcrypt.hash(otp, salt);
      const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 15) * 60 * 1000);

      user.resetPasswordOTP = hashedOTP;
      user.resetPasswordExpires = expiresAt;
      user.otpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save();
      
      await EmailService.sendPasswordResetEmail(user.email, user.name, otp, process.env.OTP_EXPIRY_MINUTES || 15);

      return {
        success: true,
        message: "If an account exists with this email, a password reset OTP has been sent.",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error processing forgot password request");
    }
  },
  
  verifyResetPasswordOTPService: async (email, otp) => {
     try {
       if (!email || !otp) throw new HttpException(400, "Please provide email and OTP");
       
       const user = await UserModel.findOne({ email: email.trim() });
       if (!user) {
          throw new HttpException(400, "Invalid or incorrect OTP"); // Generic error
       }
       
       // Max attempts check
       const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
       if (user.otpAttempts >= maxAttempts) {
         user.resetPasswordOTP = null;
         await user.save();
         throw new HttpException(429, "Too many failed attempts. Please request a new OTP.");
       }
       
       if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
         throw new HttpException(400, "OTP has expired. Please request a new one.");
       }
       
       if (!user.resetPasswordOTP) throw new HttpException(400, "No OTP requested");
       
       const isMatch = await bcrypt.compare(otp.toString(), user.resetPasswordOTP);
       if (!isMatch) {
         user.otpAttempts += 1;
         await user.save();
         throw new HttpException(400, "Invalid or incorrect OTP");
       }
       
       // Note: Don't invalidate OTP here yet! They need it (or a reset token) to submit the new password.
       // We'll return a temporary resetToken
       const resetToken = jwt.sign({ userId: user._id, purpose: 'password_reset' }, process.env.jwtsecret || "your-secret-key", { expiresIn: '15m' });
       
       return { success: true, message: "OTP verified. Proceed to reset password.", resetToken };
     } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(500, "Error verifying OTP");
     }
  },

  resetPasswordService: async ({ resetToken, newPassword }) => {
    try {
      if (!resetToken || !newPassword) {
        throw new HttpException(400, "Missing required fields");
      }

      if (newPassword.length < 6) {
        throw new HttpException(400, "New password must be at least 6 characters long");
      }
      
      let decoded;
      try {
        decoded = jwt.verify(resetToken, process.env.jwtsecret || "your-secret-key");
      } catch (err) {
        throw new HttpException(400, "Invalid or expired reset token. Please restart the password reset process.");
      }
      
      if (decoded.purpose !== 'password_reset') throw new HttpException(400, "Invalid token");

      const user = await UserModel.findById(decoded.userId);
      if (!user) throw new HttpException(404, "User account not found");

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

  addWalletPointsService: async (userId, amount) => {
    try {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new HttpException(400, "Please provide a valid positive wallet points amount");
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      user.walletBalance = (user.walletBalance || 0) + parsedAmount;
      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;

      return {
        success: true,
        message: `Successfully added ${parsedAmount} wallet points to ${user.name}`,
        user: updatedUser
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error adding wallet points");
    }
  }
};

module.exports = UserServices;
