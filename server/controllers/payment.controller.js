const PaymentServices = require("../services/payment.service");

const PaymentController = {
  createOrder: async (req, res, next) => {
    try {
      const { amount } = req.body;
      const order = await PaymentServices.createRazorpayOrder(amount);
      res.status(200).send(order);
    } catch (error) {
      next(error);
    }
  },
  
  verifySignature: async (req, res, next) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const result = await PaymentServices.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = PaymentController;
