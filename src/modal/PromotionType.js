const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const promotionTypeSchema = new Schema({
  name: {
    type: String,
  },
  code: {
    type: Number,
  },
});

const PromotionType = mongoose.model("PromotionType", promotionTypeSchema);

module.exports = PromotionType;
