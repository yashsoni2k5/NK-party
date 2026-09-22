const BannerModel = require("../models/banner.model");
const HttpException = require("../exceptions/HttpException");

const BannerServices = {
  getAllActiveBanners: async () => {
    try {
      return await BannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    } catch (error) {
      throw new HttpException(500, "Error fetching banners");
    }
  },

  getAllBannersAdmin: async () => {
    try {
      return await BannerModel.find().sort({ order: 1, createdAt: -1 });
    } catch (error) {
      throw new HttpException(500, "Error fetching all banners for admin");
    }
  },

  createBanner: async (data) => {
    try {
      if (!data.imageUrl) throw new HttpException(400, "Image URL is required");
      const banner = new BannerModel(data);
      await banner.save();
      return banner;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error creating banner");
    }
  },

  deleteBanner: async (id) => {
    try {
      const deleted = await BannerModel.findByIdAndDelete(id);
      if (!deleted) throw new HttpException(404, "Banner not found");
      return { success: true, message: "Banner deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error deleting banner");
    }
  },

  updateBanner: async (id, updateData) => {
    try {
      const banner = await BannerModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!banner) throw new HttpException(404, "Banner not found");
      return banner;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error updating banner");
    }
  }
};

module.exports = BannerServices;
