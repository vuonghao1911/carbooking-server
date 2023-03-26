const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const promotionResultSchema = new Schema({
  promotionLineId: {
    type: ObjectId,
  },
  ticketId: {
    type: ObjectId,
  },

  discountAmount: {
    type: Number,
  },
});

const PromotionResult = mongoose.model(
  "PromotionResult",
  promotionResultSchema
);

module.exports = PromotionResult;
