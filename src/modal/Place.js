const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const placeSchema = new Schema({
  name: {
    type: String,
  },
  busStation: [
    {
      address: {
        name: {
          type: String,
        },
        detailAddress: {
          type: String,
        },
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
  ],
  code: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
