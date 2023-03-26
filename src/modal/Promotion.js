const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const promotionSchema = new Schema(
  {
    percentDiscount: {
      type: Number,
    },
    quantityTicket: {
      type: Number,
    },

    purchaseAmount: {
      type: Number,
    },
    moneyReduced: {
      type: Number,
    },
    maximumDiscount: {
      type: Number,
    },
    budget: {
      type: Number,
    },

    code: {
      type: Number,
    },
    promotionHeaderId: {
      type: ObjectId,
    },
    promotionLineId: {
      type: ObjectId,
    },
    remainingBudget: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", promotionSchema);

module.exports = Promotion;
