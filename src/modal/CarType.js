const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const carTypeSchema = new Schema({
  type: {
    type: String,
    required: true,
  },

  chair: [
    {
      seats: {
        type: String,
        required: true,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
  ],
  code: {
    type: String,
  },
});

const CarType = mongoose.model("CarType", carTypeSchema);

module.exports = CarType;
