const OrderServices = require("../services/order.service");

const OrderController = {
  getAllOrders: async (req, res, next) => {
    try {
      const orders = await OrderServices.getAllOrdersService();
      res.status(200).send(orders);
    } catch (error) {
      next(error);
    }
  },
  getUserOrders: async (req, res, next) => {
    const userId = req.body.user;
    try {
      const orders = await OrderServices.getUserOrderServices(userId);
      res.status(200).send(orders);
    } catch (error) {
      next(error);
    }
  },
  createOrder: async (req, res, next) => {
    const userId = req.body.user;
    const data = req.body;
    try {
      const order = await OrderServices.createOrderService(data, userId);
      res.status(201).send(order);
    } catch (error) {
      next(error);
    }
  },
  getOrdersById: async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
      const order = await OrderServices.getOrderByIdServices(orderId);
      res.status(200).send(order);
    } catch (error) {
      next(error);
    }
  },
  updateOrderById: async (req, res, next) => {
    const orderId = req.params.orderId;
    const changes = { ...req.body };
    
    // The AdminAuth middleware injects the Admin's userId into req.body.user.
    // We must remove it so we don't accidentally reassign the order to the Admin!
    delete changes.user;

    try {
      const order = await OrderServices.updateOrderByIdService(
        orderId,
        changes
      );
      res.status(200).send(order);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = OrderController;
