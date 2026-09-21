const express = require("express");
const BannerController = require("../controllers/banner.controller");
const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
const router = express.Router();
const path = "/banners";

router.get("/", BannerController.getActiveBanners); // Public
router.get("/all", EnsureAdmin, BannerController.getAllBannersAdmin);
router.post("/", EnsureAdmin, BannerController.createBanner);
router.delete("/:id", EnsureAdmin, BannerController.deleteBanner);

module.exports = { path, router };
