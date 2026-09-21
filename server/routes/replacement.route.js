const express = require("express");
const EnsureAuth = require("../middlewares/Auth.middleware");
const EnsureAdmin = require("../middlewares/AdminAuth.middleware");
const ReplacementController = require("../controllers/replacement.controller");
const router = express.Router();
const path = "/replacements";

router.post("/", EnsureAuth, ReplacementController.createRequest);
router.get("/", EnsureAdmin, ReplacementController.getAllRequests);
router.patch("/:requestId", EnsureAdmin, ReplacementController.updateRequest);

module.exports = { path, router };
