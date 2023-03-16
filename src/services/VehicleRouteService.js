const Car = require("../modal/Car");
const carType = require("../modal/CarType");
const VehicleRoute = require("../modal/VehicleRoute");
const Price = require("../modal/Price");
const PriceHeader = require("../modal/PriceHeader");
const promotionsHeader = require("../modal/PromotionHeader");
const Promotions = require("../modal/Promotion");
const PromotionsLine = require("../modal/PromotionLine");
const DepartureTime = require("../modal/DepartureTime");
var mongoose = require("mongoose");
const Route = require("../modal/Route");
const CarType = require("../modal/CarType");

const VehicleRouteService = {
  addRoutes: async (
    startDate,
    startTimeId,
    departure,
    destination,
    intendTime,
    carId,
    endDate
  ) => {
    var code;
    let startDateNew = new Date(startDate);
    console.log("fsf", startDateNew);
    let endDateNew = new Date(endDate);

    var arrayResults = [];
    const { chair } = await Car.findById(carId);

    const startTime = await DepartureTime.findById(startTimeId);
    var date = "October 13";
    var year = "2044";
    const newendTime = new Date(`${date},${year} ${startTime.time}`);
    const endTime = new Date(newendTime.getTime() + intendTime * 3600 * 1000);
    const endTimeString = endTime.toString().substring(16, 21);
    while (startDateNew <= endDateNew) {
      const codeFind = await VehicleRoute.find().sort({ _id: -1 }).limit(1);

      if (codeFind[0]) {
        code = codeFind[0].code;
      } else {
        code = 0;
      }
      const vehicleRoute = new VehicleRoute({
        startDate: startDateNew,
        startTime: startTimeId,
        endTime: endTimeString,
        departure: departure,
        destination: destination,
        carId: carId,
        chair: chair,
        code: code + 1,
      });

      const vehicle = await vehicleRoute.save();
      if (vehicle) {
        arrayResults.push(vehicle);

        console.log(startDateNew);
      }
      startDateNew.setDate(startDateNew.getDate() + 1);
    }
    return arrayResults;
  },
  // get list car unique with starttime in route and start date
  getListCarbyStartTime: async (startDate, startTimeId, routeId) => {
    var arrayResults = [];
    var arryListCarDate = [];
    const result = [];
    const time = await DepartureTime.findById(startTimeId);
    // get list car
    var listCar = await Car.find();
    // get infomation route
    const { departure, destination, intendTime } = await Route.findById(
      routeId
    );

    var arrayFinal = [];
    const list = await VehicleRoute.find();

    for (const elem of list) {
      // check startDate of vehicleRoute with StartDate Body
      if (
        new Date(elem.startDate).toLocaleDateString() ==
        new Date(startDate).toLocaleDateString()
      ) {
        arryListCarDate.push(elem);
      }
    }
    console.log("listcar", arryListCarDate);
    // find vehicleRoute by startTime, route
    const listVehcle = await VehicleRoute.find({
      startTime: startTimeId,
      destination: destination._id,
      departure: departure._id,
    });
    function removeObjectWithId(arr, id) {
      const objWithIdIndex = arr.findIndex((obj) => obj._id == id);
      console.log(objWithIdIndex);
      if (objWithIdIndex > -1) {
        arr.splice(objWithIdIndex, 1);
      }

      return arr;
    }

    // check listVehcle ==0? find vehicleRoute of ListCar
    if (listVehcle.length == 0) {
      for (const e of listCar) {
        const carTrip = await VehicleRoute.findOne({
          carId: e._id,
          startDate: { $gte: new Date(startDate) },
          destination: destination._id,
          departure: departure._id,
        });
        //check endTime vehicleRoute of Car
        if (carTrip) {
          if (
            carTrip.endTime.substring(0, 2) * 1 + intendTime + 1 >
            time.time.substring(0, 2) * 1
          ) {
            console.log("cartrip", carTrip.endTime.substring(0, 2));
            arrayFinal.push(e);
          }
        } else {
          //find car already have a route in date body
          // console.log("listCarDate", arryListCarDate);
          if (arryListCarDate.length > 0) {
            for (const e of arryListCarDate) {
              //   // get list car unique
              removeObjectWithId(listCar, e.carId.toString());
            }
            arrayFinal.push(...listCar);
            //  console.log("carUni", listCar);

            let cachedObject = {};
            arrayFinal.map((item) => (cachedObject[item.id] = item));
            arrayFinal = Object.values(cachedObject);
          } else {
            arrayFinal.push(...listCar);
            console.log("list xe khong trung");
            let cachedObject = {};
            arrayFinal.map((item) => (cachedObject[item.id] = item));
            arrayFinal = Object.values(cachedObject);
          }
        }
      }
    } else {
      // find car of route
      for (const vehcle of listVehcle) {
        if (
          vehcle.startDate.toLocaleDateString() ===
          new Date(startDate).toLocaleDateString()
        ) {
          arrayResults.push(vehcle);
        }
      }

      const arrayList1 = new Set(arrayResults);
      const arrayList = [...arrayList1];
      //  console.log("listcdss", arrayList);
      // get list car unique
      for (const e of arrayList) {
        removeObjectWithId(listCar, e.carId.toString());

        arrayFinal.push(...listCar);

        let cachedObject = {};
        arrayFinal.map((item) => (cachedObject[item.id] = item));
        arrayFinal = Object.values(cachedObject);
        //  console.log("fsfs", listCar);
      }
    }
    for (const car of arrayFinal) {
      const carType = await CarType.findById(car.typeCarId);
      result.push({
        id: car._id,
        car: car.licensePlates,
        carType: carType.type,
      });
    }

    return result;
  },

  findVehicleRoute: async (departure, destination) => {
    const vehicleRoute = await VehicleRoute.aggregate([
      {
        $match: {
          departure: new mongoose.Types.ObjectId(departure),
          destination: new mongoose.Types.ObjectId(destination),
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
    ]);
    return vehicleRoute;
  },
  checkPriceRoute: async (currenDate, routeId, carTypeId) => {
    const priceHeader = await PriceHeader.findOne({
      endDate: { $gte: new Date(currenDate) },
      startDate: { $lte: new Date(currenDate) },
    });
    const price = await Price.findOne({
      priceHeaderId: priceHeader._id,
      routeId: routeId,
      carTypeId: carTypeId,
    });

    return price;
  },
  checkPromotionsRoute: async (currenDate) => {
    const promotionHeader = await promotionsHeader.findOne({
      endDate: { $gte: new Date(currenDate) },
      startDate: { $lte: new Date(currenDate) },
    });
    if (promotionHeader) {
      const promotionLine = await PromotionsLine.findOne({
        promotionHeaderId: promotionHeader._id,
        endDate: { $gte: new Date(currenDate) },
        startDate: { $lte: new Date(currenDate) },
        status: true,
      });
      if (promotionLine) {
        const promotion = await Promotions.findOne({
          promotionHeaderId: promotionHeader._id,
          promotionLineId: promotionLine._id,
        });
        return { promotionHeader, promotion, promotionLine };
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  getInfoVehicleById: async (vehicleRouteId) => {
    const vehicleRoute = await VehicleRoute.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(vehicleRouteId),
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
    ]);
    return vehicleRoute;
  },
};

module.exports = VehicleRouteService;
