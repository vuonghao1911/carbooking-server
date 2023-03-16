const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const priceSchema = new Schema(
  {
    price: {
      type: Number,
    },
    priceHeaderId: {
      type: ObjectId,
    },
    routeId: {
      type: ObjectId,
    },
    carTypeId: {
      type: ObjectId,
    },
    code: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Price = mongoose.model("Price", priceSchema);

module.exports = Price;
