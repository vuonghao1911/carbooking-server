const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const vehicleRouteSchema = new Schema({
  startDate: {
    type: Date,
  },
  startTime: {
    type: ObjectId,
  },
  endTime: {
    type: String,
  },
  departure: {
    type: ObjectId,
  },
  destination: {
    type: ObjectId,
  },
  carId: {
    type: ObjectId,
  },
  chair: [],
  code: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const VehicleRoute = mongoose.model("VehicleRoute", vehicleRouteSchema);

module.exports = VehicleRoute;
