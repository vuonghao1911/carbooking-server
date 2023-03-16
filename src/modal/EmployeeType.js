const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const employeeTypeSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
});

const EmployeeType = mongoose.model("EmployeeType", employeeTypeSchema);

module.exports = EmployeeType;
