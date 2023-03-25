const Car = require("../modal/Car");
const CarType = require("../modal/CarType");
const VehicleRoute = require("../modal/VehicleRoute");
var mongoose = require("mongoose");
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
  findVehicleRouteByIdCar: async (carId) => {
    const vehicleRoute = await VehicleRoute.aggregate([
      {
        $match: {
          carId: new mongoose.Types.ObjectId(carId),
        },
      },
      {
        $lookup: {
          from: "cars",
          localField: "carId",
          foreignField: "_id",
          as: "car",
        },
      },
      {
        $unwind: "$car",
      },
      {
        $lookup: {
          from: "places",
          localField: "departure",
          foreignField: "_id",
          as: "departure",
        },
      },
      {
        $unwind: "$departure",
      },
      {
        $lookup: {
          from: "departuretimes",
          localField: "startTime",
          foreignField: "_id",
          as: "departuretimes",
        },
      },
      {
        $unwind: "$departuretimes",
      },
      {
        $lookup: {
          from: "places",
          localField: "destination",
          foreignField: "_id",
          as: "destination",
        },
      },
      {
        $unwind: "$destination",
      },
      {
        $lookup: {
          from: "cartypes",
          localField: "car.typeCarId",
          foreignField: "_id",
          as: "cartype",
        },
      },
      {
        $unwind: "$cartype",
      },

      {
        $project: {
          _id: "$_id",
          startDate: "$startDate",
          startTime: "$departuretimes.time",
          endTime: "$endTime",
          departure: "$departure",
          destination: "$destination",
          licensePlates: "$car.licensePlates",
          carType: "$cartype.type",
          carTypeId: "$cartype._id",
          chair: "$chair",
        },
      },
      { $sort: { startDate: -1 } },
    ]);
    return vehicleRoute;
  },
};

module.exports = CarService;
