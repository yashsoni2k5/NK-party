const PaymentServices = require("../services/payment.service");

const OrderServices = require("../services/order.service");

const PaymentController = {
  createOrder: async (req, res, next) => {
    try {
      const { products, usedWalletAmount } = req.body;
      const userId = req.user; // populated by EnsureAuth
      
      const { payableAmount } = await OrderServices.calculateOrderTotals(products, usedWalletAmount, userId);
      
      if (payableAmount === 0) {
        return res.status(200).send({
          id: null,
          amount: 0,
          currency: "INR",
          message: "Order fully covered by wallet"
        });
      }

      const order = await PaymentServices.createRazorpayOrder(payableAmount);
      res.status(200).send(order);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = PaymentController;
