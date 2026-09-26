const UserServices = require("../services/user.service");

const UserController = {
  getUser: async (req, res, next) => {
    const userId = req.params.userId;
    try {
      const user = await UserServices.getUserService(userId);
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  },
  getCurrentOnlineUser: async (req, res, next) => {
    const userId = req.body.user;
    try {
      const user = await UserServices.getCurrentUser(userId);
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  },
  updateCurrentOnlineUser: async (req, res, next) => {
    const userId = req.body.user;
    const changes = req.body.changes;
    try {
      const user = await UserServices.updateCurrentUser(userId, changes);
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  },

  registerUser: async (req, res, next) => {
    const registrationDetails = req.body;
    try {
      const response = await UserServices.registerUserService(registrationDetails);
      res.status(201).send(response);
    } catch (error) {
      next(error);
    }
  },

  verifyEmailOTP: async (req, res, next) => {
    const { email, otp } = req.body;
    try {
      const response = await UserServices.verifyEmailOTPService(email, otp);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  resendEmailOTP: async (req, res, next) => {
    const { email } = req.body;
    try {
      const response = await UserServices.resendEmailOTPService(email);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  loginUser: async (req, res, next) => {
    const loginDetails = req.body;
    try {
      const response = await UserServices.loginUserService(loginDetails);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const users = await UserServices.getAllUsersService();
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { identifier } = req.body; // Actually using email now
      const response = await UserServices.forgotPasswordService(identifier);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  verifyResetPasswordOTP: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const response = await UserServices.verifyResetPasswordOTPService(email, otp);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const response = await UserServices.resetPasswordService(req.body);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },

  addWalletPoints: async (req, res, next) => {
    const { userId } = req.params;
    const { amount } = req.body;
    try {
      const response = await UserServices.addWalletPointsService(userId, amount);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = UserController;
