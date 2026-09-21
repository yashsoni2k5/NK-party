const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const BannerModel = mongoose.model("banners", bannerSchema);
module.exports = BannerModel;
