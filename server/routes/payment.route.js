const express = require("express");
const EnsureAuth = require("../middlewares/Auth.middleware");
const PaymentController = require("../controllers/payment.controller");
const router = express.Router();
const path = "/payment";

router.post("/orders", EnsureAuth, PaymentController.createOrder);

module.exports = { path, router };
