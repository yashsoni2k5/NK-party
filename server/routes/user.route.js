const express = require("express");
const UserController = require("../controllers/user.controller");
const EnsureAuth = require("../middlewares/Auth.middleware");
const router = express.Router();
const path = "/users";

router.post("/register", UserController.registerUser);
router.post("/verify-email-otp", UserController.verifyEmailOTP);
router.post("/resend-email-otp", UserController.resendEmailOTP);

router.post("/login", UserController.loginUser);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-reset-otp", UserController.verifyResetPasswordOTP);
router.post("/reset-password", UserController.resetPassword);

router.get("/user-details/:userId", EnsureAuth, UserController.getUser);

router.get("/me", EnsureAuth, UserController.getCurrentOnlineUser);
router.patch("/me", EnsureAuth, UserController.updateCurrentOnlineUser);

const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
router.get("/all", EnsureAdmin, UserController.getAllUsers);
router.post("/:userId/wallet/add", EnsureAdmin, UserController.addWalletPoints);

module.exports = { path, router };
