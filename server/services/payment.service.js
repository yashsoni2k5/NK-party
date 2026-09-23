const Razorpay = require("razorpay");
const crypto = require("crypto");
const HttpException = require("../exceptions/HttpException");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

const PaymentServices = {
  createRazorpayOrder: async (amount) => {
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
      };
      
      // If we are using dummy keys, simulate a successful Razorpay order response
      if (!process.env.RAZORPAY_KEY_ID) {
        return {
          id: `order_dummy_${Math.floor(Math.random() * 1000000)}`,
          entity: "order",
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: "INR",
          receipt: options.receipt,
          status: "created",
          attempts: 0,
        };
      }

      const order = await razorpay.orders.create(options);
      if (!order) {
        throw new HttpException(500, "Error creating razorpay order");
      }
      return order;
    } catch (error) {
      throw new HttpException(500, error.message || "Error creating payment order");
    }
  },

  verifyRazorpaySignature: async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    try {
      // If we are using dummy mode from frontend, bypass signature verification
      if (!process.env.RAZORPAY_KEY_ID || razorpay_signature === "dummy_sig") {
        return { success: true, message: "Payment verified successfully (Mock Mode)" };
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpay_signature) {
        throw new HttpException(400, "Transaction not legit!");
      }
      return { success: true, message: "Payment verified successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error verifying payment signature");
    }
  },

  refundPayment: async (paymentId, amount) => {
    try {
      if (!process.env.RAZORPAY_KEY_ID || paymentId === "pay_dummy123" || paymentId.startsWith("pay_dummy")) {
        return { success: true, message: "Refund processed successfully (Mock Mode)" };
      }
      
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // amount in paise
      });
      
      if (!refund) {
        throw new HttpException(500, "Error initiating razorpay refund");
      }
      return refund;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.description || error.message || "Error processing refund");
    }
  }
};

module.exports = PaymentServices;
