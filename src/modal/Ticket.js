const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ticketSchema = new Schema(
  {
    vehicleRouteId: {
      type: ObjectId,
      required: true,
    },
    customerId: {
      type: ObjectId,
    },
    quantity: {
      type: Number,
    },
    chair: [],
    locationBus: {},
    status: {
      type: Number,
      default: 1, // 0 chua thanh toan  1. Da thanh toan  2. Da huy ve  3. Tra ve
    },
    phoneNumber: {
      type: String,
    },
    code: {
      type: Number,
    },
    priceId: {
      type: ObjectId,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
