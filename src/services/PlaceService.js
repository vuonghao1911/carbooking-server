const Place = require("../modal/Place");
const Route = require("../modal/Route");

// place and route services

const PlaceService = {
  savePlace: async (place) => {
    return await place.save();
  },
  getCarById: async (_id) => {
    return await Car.findById(_id);
  },
  saveRoute: async (route) => {
    return await route.save();
  },
};

module.exports = PlaceService;
