const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const carSchema = new Schema({
  licensePlates: {
    type: String,
  },
  typeCarId: {
    type: ObjectId,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  purchaseDate: {
    type: Date,
  },
  chair: [],
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
