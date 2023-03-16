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
  employeeId: {
    type: ObjectId,
  },
  chair: [],
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
