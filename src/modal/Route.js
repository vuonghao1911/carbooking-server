const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const routeSchema = new Schema({
  intendTime: {
    type: Number,
  },
  departure: {},
  destination: {},
  status: {
    type: Boolean,
    default: true,
  },
  code: {
    type: String,
  },
  routeType: {
    type: ObjectId,
  },
});

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;
