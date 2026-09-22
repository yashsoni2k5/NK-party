const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    profilePhoto: {
      type: "string",
      default:
        "https://res.cloudinary.com/megamart/image/upload/f_auto,q_auto/v1/shoperz/dakwz4yoq66cwwbdb9db",
    },
    name: {
      type: String,
      required: [true, "please provide a name"],
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
      required: [true, "please provide mobile phone number"],
    },
    password: {
      type: String,
      required: [true, "please provide a password"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user", // Default role can be specified here
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
