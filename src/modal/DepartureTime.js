const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const departureTimeSchema = new Schema({
  code: {
    type: String,
  },
  time: {
    type: String,
  },
});

const DepartureTime = mongoose.model("DepartureTime", departureTimeSchema);

module.exports = DepartureTime;
