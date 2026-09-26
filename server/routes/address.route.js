const express = require("express");
const EnsureAuth = require("../middlewares/Auth.middleware");
const AddressController = require("../controllers/address.controller");
const router = express.Router();
const path = "/address";

router.get("/", EnsureAuth, AddressController.getUserAddresses);
router.post("/", EnsureAuth, AddressController.createAddress);
router.get("/pincode/:pincode", AddressController.lookupPincode);

module.exports = { path, router };
