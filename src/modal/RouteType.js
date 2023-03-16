const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const RouteTypeSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const RouteType = mongoose.model("RouteType", RouteTypeSchema);

module.exports = RouteType;
