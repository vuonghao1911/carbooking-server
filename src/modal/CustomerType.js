const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const customerTypeSchema = new Schema({
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

const CustomerType = mongoose.model("CustomerType", customerTypeSchema);

module.exports = CustomerType;
