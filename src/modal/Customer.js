const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const customerSchema = new Schema({
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
  },
  email: {
    type: String,
    default: null,
  },

  dateOfBirth: {
    type: Date,
    default: null,
  },

  address: {
    type: {
      ward: {
        type: String,
        default: null,
      },
      district: {
        type: String,
        default: null,
      },
      province: {
        type: String,
        default: null,
      },
    },
    default: null,
  },

  code: {
    type: String,
  },
  customerTypeId: {
    type: ObjectId,
    default: null,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

//check userId
customerSchema.statics.checkByIds = async (_id, message = "Customer") => {
  const isExists = await Customer.findOne({
    _id,
  });

  if (!isExists) throw new Error();
};

customerSchema.statics.deleteByIds = async (_id, message = "Customer") => {
  const rs = await Customer.deleteOne({
    _id,
  });

  const { deletedCount } = rs;
  if (deletedCount === 0) throw new NotFoundError(message);
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
