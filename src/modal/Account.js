const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const accountSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  passWord: {
    type: String,
    required: true,
  },
  role: {
    type: Boolean,
    default: false,
  },
  idUser: {
    type: ObjectId,
    required: true,
  },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
