const BannerServices = require("../services/banner.service");

const BannerController = {
  getActiveBanners: async (req, res, next) => {
    try {
      const banners = await BannerServices.getAllActiveBanners();
      res.status(200).send(banners);
    } catch (error) {
      next(error);
    }
  },

  getAllBannersAdmin: async (req, res, next) => {
    try {
      const banners = await BannerServices.getAllBannersAdmin();
      res.status(200).send(banners);
    } catch (error) {
      next(error);
    }
  },

  createBanner: async (req, res, next) => {
    try {
      if (req.file) {
        req.body.imageUrl = req.file.path;
      }
      const banner = await BannerServices.createBanner(req.body);
      res.status(201).send(banner);
    } catch (error) {
      next(error);
    }
  },

  deleteBanner: async (req, res, next) => {
    try {
      const response = await BannerServices.deleteBanner(req.params.id);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  updateBanner: async (req, res, next) => {
    try {
      if (req.file) {
        req.body.imageUrl = req.file.path;
      }
      const banner = await BannerServices.updateBanner(req.params.id, req.body);
      res.status(200).send(banner);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = BannerController;
