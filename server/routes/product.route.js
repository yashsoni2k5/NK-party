const express = require("express");
const ProductController = require("../controllers/product.controller");
const EnsureAuth = require("../middlewares/Auth.middleware");
const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
const router = express.Router();
const path = "/products";

router.post("/", EnsureAdmin, ProductController.addProduct);
router.get("/:productId", ProductController.getProduct);
router.patch("/:productId", EnsureAdmin, ProductController.updateProduct);
router.delete("/:productId", EnsureAdmin, ProductController.deleteProduct);
router.get("/", ProductController.getAllProducts);
router.get("/home/random", ProductController.getRandomProducts);
router.get("/search/:search", ProductController.getSearchResults);
router.post("/:productId/review", EnsureAuth, ProductController.addReview);

module.exports = { path, router };
