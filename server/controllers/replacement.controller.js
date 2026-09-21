const ReplacementServices = require("../services/replacement.service");

const ReplacementController = {
  createRequest: async (req, res, next) => {
    try {
      const userId = req.body.user;
      const data = req.body;
      const request = await ReplacementServices.createReplacementRequest(userId, data);
      res.status(201).send(request);
    } catch (error) {
      next(error);
    }
  },
  
  getAllRequests: async (req, res, next) => {
    try {
      const requests = await ReplacementServices.getAllReplacements();
      res.status(200).send(requests);
    } catch (error) {
      next(error);
    }
  },

  updateRequest: async (req, res, next) => {
    try {
      const { status } = req.body;
      const requestId = req.params.requestId;
      const updated = await ReplacementServices.updateReplacementStatus(requestId, status);
      res.status(200).send(updated);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ReplacementController;
