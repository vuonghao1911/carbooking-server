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
    var listCar = await Car.find({ status: true });
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

    // find vehicleRoute by startTime, route
    const listVehcle = await VehicleRoute.find({
      startTime: startTimeId,
      destination: destination._id,
      departure: departure._id,
    });
    function removeObjectWithId(arr, id) {
      const objWithIdIndex = arr.findIndex((obj) => obj._id == id);

      if (objWithIdIndex > -1) {
        arr.splice(objWithIdIndex, 1);
      }

      return arr;
    }

    // check listVehcle ==0? find vehicleRoute of ListCar
    if (listVehcle?.length == 0) {
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
            arrayFinal.push(e);
          }
        } else {
          //find car already have a route in date body
          // console.log("listCarDate", arryListCarDate);
          if (arryListCarDate?.length > 0) {
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
          new Date(vehcle.startDate).toLocaleDateString() ===
          new Date(startDate).toLocaleDateString()
        ) {
          arrayResults.push(vehcle);
        }
      }

      const arrayList1 = new Set(arrayResults);
      const arrayList = [...arrayList1];

      //  console.log("listcdss", arrayList);
      if (arrayList.length > 0 && arrayList) {
        // get list car unique
        for (const e of arrayList) {
          removeObjectWithId(listCar, e.carId.toString());

          arrayFinal.push(...listCar);

          let cachedObject = {};
          arrayFinal.map((item) => (cachedObject[item.id] = item));
          arrayFinal = Object.values(cachedObject);
          //  console.log("fsfs", listCar);
        }
      } else {
        arrayFinal.push(...listCar);
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
  // search vehicle route
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
      { $sort: { startDate: -1 } },
    ]);
    return vehicleRoute;
  },

  // get vehicleRoute by current date
  getVehicleRouteCurrentDate: async (date) => {
    const vehicleRoute = await VehicleRoute.aggregate([
      {
        $match: {
          $and: [
            { startDate: { $lte: new Date(date) } },
            { startDate: { $gte: new Date(date) } },
          ],
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
  // check price route
  checkPriceRoute: async (currenDate, routeId, carTypeId) => {
    const priceHeader = await PriceHeader.find({
      endDate: { $gte: new Date(currenDate) },
      startDate: { $lte: new Date(currenDate) },
      status: true,
    });
    var price = null;
    for (const elem of priceHeader) {
      const priceFind = await Price.findOne({
        priceHeaderId: elem._id,
        routeId: routeId,
        carTypeId: carTypeId,
      });
      if (priceFind) {
        price = priceFind;
      }
    }
    return price;
  },
  // check promotion route
  checkPromotionsRoute: async (currenDate) => {
    const arrayFilters = [];
    const promotionHeader = await promotionsHeader.find({
      endDate: { $gte: new Date(currenDate) },
      startDate: { $lte: new Date(currenDate) },
      status: true,
    });
    if (promotionHeader?.length > 0) {
      for (const promoHeader of promotionHeader) {
        const promotionLine = await PromotionsLine.find({
          promotionHeaderId: promoHeader._id,
          endDate: { $gte: new Date(currenDate) },
          startDate: { $lte: new Date(currenDate) },
          status: true,
        });
        //  console.log(promotionLine);
        if (promotionLine?.length > 0) {
          for (const elem of promotionLine) {
            const promotion = await Promotions.findOne({
              promotionHeaderId: promoHeader._id,
              promotionLineId: elem._id,
            });
            //  console.log(elem._id);
            if (promotion) {
              arrayFilters.push({
                promotionDetail: promotion,
                promotionLine: elem,
              });
            }
          }
          return { promotion: arrayFilters };
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  },
  // get info vehicle by id vehicle
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
  // get infor vehicle unique start date
  getInfoVehicleCurrenDate: async (startDate) => {
    const vehicleRoute = await VehicleRoute.aggregate([
      {
        $match: {
          $and: [
            { startDate: { $lte: new Date(startDate) } },
            { startDate: { $gte: new Date(startDate) } },
          ],
        },
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
        $project: {
          startDate: "$startDate",

          departure: {
            _id: 1,
            name: 1,
          },
          destination: {
            _id: 1,
            name: 1,
          },
        },
      },
      {
        $sort: { startDate: -1 },
      },
    ]);
    return vehicleRoute;
  },
};

module.exports = VehicleRouteService;
