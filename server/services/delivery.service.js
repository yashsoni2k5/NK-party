const HttpException = require("../exceptions/HttpException");

/**
 * Mock Service mimicking the Shadowfax Delivery API Integration.
 * In a real application, you would use axios/fetch to hit Shadowfax's REST APIs.
 */
const DeliveryServices = {
  dispatchOrder: async (order) => {
    try {
      console.log(`[SHADOWFAX] Initiating delivery dispatch for Order ID: ${order._id}`);
      
      const payload = {
        order_details: {
          client_order_id: order._id.toString(),
          order_value: order.total,
          payment_method: "Prepaid", // Assuming Razorpay handled it
        },
        customer_details: {
          name: order.user?.name || "Customer",
          contact: order.user?.mobile || "9999999999",
          address: {
            line_1: order.deliveryAddress?.house_no,
            line_2: order.deliveryAddress?.area,
            city: order.deliveryAddress?.city,
            pincode: order.deliveryAddress?.pincode,
          },
        }
      };

      console.log("[SHADOWFAX] Payload generated:", JSON.stringify(payload, null, 2));

      // Simulate network request to Shadowfax API
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`[SHADOWFAX] Order ${order._id} successfully dispatched to Shadowfax fleet.`);
      
      return {
        success: true,
        tracking_id: `SFX${Math.floor(Math.random() * 100000000)}`,
        status: "AWB_ASSIGNED"
      };
    } catch (error) {
      console.error("[SHADOWFAX] Dispatch failed:", error);
      throw new HttpException(500, "Failed to dispatch order to Shadowfax");
    }
  },

  trackOrder: async (trackingId) => {
    // Mock tracking
    return {
      tracking_id: trackingId,
      current_status: "IN_TRANSIT",
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
};

module.exports = DeliveryServices;
