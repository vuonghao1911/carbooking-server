const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const promotionLineSchema = new Schema(
  {
    startDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    endDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    description: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
    },
    title: {
      type: String,
    },
    promotionTypeId: {
      type: ObjectId,
    },
    promotionHeaderId: {
      type: ObjectId,
    },
    routeTypeId: {
      type: ObjectId,
    },
    userUpdate: {
      type: ObjectId,
    },
    userCreate: {
      type: ObjectId,
    },
  },

  { timestamps: true }
);

const PromotionLine = mongoose.model("PromotionLine", promotionLineSchema);

module.exports = PromotionLine;
