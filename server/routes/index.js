const UserRouter = require("./user.route");
const ProductRouter = require("./product.route");
const CartRouter = require("./cart.route");
const AddressRouter = require("./address.route");
const OrderRouter = require("./order.route");
const ReplacementRouter = require("./replacement.route");
const PaymentRouter = require("./payment.route");
const BannerRouter = require("./banner.route");

const Routes = [
  UserRouter,
  ProductRouter,
  CartRouter,
  AddressRouter,
  OrderRouter,
  ReplacementRouter,
  PaymentRouter,
  BannerRouter,
];

module.exports = Routes;
