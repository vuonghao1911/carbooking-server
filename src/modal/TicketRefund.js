const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ticketRefundSchema = new Schema(
  {
    ticketId: {
      type: ObjectId,
      required: true,
    },
    chair: [],

    status: {
      type: Boolean,
      default: true, // true  hoan thanh , false dang hoan tra
    },
    code: {
      type: Number,
    },
    note: {
      type: String,
    },
    returnAmount: {
      type: Number,
    },
    employeeId: {
      type: ObjectId,
    },
    isCancleLate: {
      type: Boolean,
      default: false, // true cancle after 2 hours
    },
  },
  { timestamps: true }
);

const TicketRefund = mongoose.model("TicketRefund", ticketRefundSchema);

module.exports = TicketRefund;
