const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const employeeSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    //required: true,
  },
  typeId: {
    type: ObjectId,
    required: true,
  },
  email: {
    type: String,
  },

  dateOfBirth: {
    type: Date,
  },

  address: {
    type: {
      ward: {
        type: String,
      },
      district: {
        type: String,
      },
      province: {
        type: String,
      },
    },
  },
  gender: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
  role: {
    type: Boolean,
    default: false, // true manage // false employee
  },
  code: {
    type: Number,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
