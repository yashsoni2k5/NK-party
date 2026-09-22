const express = require("express");
const ProductController = require("../controllers/product.controller");
const EnsureAuth = require("../middlewares/Auth.middleware");
const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
const upload = require("../middlewares/upload");
const router = express.Router();
const path = "/products";

router.post("/", EnsureAdmin, upload.single("image"), ProductController.addProduct);
router.get("/:productId", ProductController.getProduct);
router.patch("/:productId", EnsureAdmin, upload.single("image"), ProductController.updateProduct);
router.delete("/:productId", EnsureAdmin, ProductController.deleteProduct);
router.get("/", ProductController.getAllProducts);
router.get("/home/random", ProductController.getRandomProducts);
router.get("/search/:search", ProductController.getSearchResults);
router.post("/:productId/review", EnsureAuth, ProductController.addReview);

module.exports = { path, router };
