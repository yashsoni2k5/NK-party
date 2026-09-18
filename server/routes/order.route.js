const express = require("express");
const EnsureAuth = require("../middlewares/Auth.middleware");
const OrderController = require("../controllers/order.controller");
const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
const router = express.Router();
const path = "/order";

router.get("/all", EnsureAdmin, OrderController.getAllOrders);
router.get("/", EnsureAuth, OrderController.getUserOrders);
router.get("/:orderId", EnsureAuth, OrderController.getOrdersById);
router.post("/", EnsureAuth, OrderController.createOrder);
router.patch("/:orderId", EnsureAdmin, OrderController.updateOrderById);

module.exports = { path, router };
