const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const priceHeaderSchema = new Schema(
  {
    title: {
      type: String,
    },

    startDate: {
      type: Date,
      default: new Date(),
    },
    endDate: {
      type: Date,
      default: new Date(),
    },

    status: {
      type: Boolean,
      default: false,
    },

    code: {
      type: Number,
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

const PriceHeader = mongoose.model("PriceHeader", priceHeaderSchema);

module.exports = PriceHeader;
