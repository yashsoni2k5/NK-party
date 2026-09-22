const express = require("express");
const BannerController = require("../controllers/banner.controller");
const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
const upload = require("../middlewares/upload");
const router = express.Router();
const path = "/banners";

router.get("/", BannerController.getActiveBanners); // Public
router.get("/all", EnsureAdmin, BannerController.getAllBannersAdmin);
router.post("/", EnsureAdmin, upload.single("image"), BannerController.createBanner);
router.put("/:id", EnsureAdmin, upload.single("image"), BannerController.updateBanner);
router.delete("/:id", EnsureAdmin, BannerController.deleteBanner);

module.exports = { path, router };
