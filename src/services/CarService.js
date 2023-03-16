const Car = require("../modal/Car");
const CarType = require("../modal/CarType");

// car and car type services

const CarService = {
  addCar: async (car) => {
    return await car.save();
  },
  getCarById: async (_id) => {
    return await Car.findById(_id);
  },
  addCarType: async (carType) => {
    return await carType.save();
  },
  getCarType: async (req, res, next) => {
    return await CarType.find();
  },
};

module.exports = CarService;
