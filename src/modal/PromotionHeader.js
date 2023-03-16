const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const promotionHeaderSchema = new Schema(
  {
    title: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    description: {
      type: String,
    },
    endDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    status: {
      type: Boolean,
      default: true,
    },
    imgUrl: {
      type: String,
    },
    code: {
      type: String,
    },
  },
  { timestamps: true }
);

const PromotionHeader = mongoose.model(
  "PromotionHeader",
  promotionHeaderSchema
);

module.exports = PromotionHeader;
