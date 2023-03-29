const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const orderSchema = new Schema(
  {
    customerId: {
      type: ObjectId,
    },
    chair: [],

    status: {
      type: Boolean,
      default: true, // true don hang da thanh toan, false tao don hang (don hang chua duoc thanh toan)
    },
    vehicleRouteId: {
      type: ObjectId,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
