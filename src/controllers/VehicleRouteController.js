const vehicleRouteService = require("../services/VehicleRouteService");
const ticketService = require("../services/TicketService");
const utilService = require("../utils/utils");
const Customer = require("../modal/Customer");
const ObjectId = require("mongoose").Types.ObjectId;
const Route = require("../modal/Route");
const RouteType = require("../modal/RouteType");
const VehicleRoute = require("../modal/VehicleRoute");
const DepartureTime = require("../modal/DepartureTime");
const Car = require("../modal/Car");
class VehicleRouteController {
  async addVehicleRoute(req, res, next) {
    const { startDate, startTimeId, routeId, carId, endDate } = req.body;
    console.log(routeId);
    var message = "success";
    try {
      const routeChoose = await Route.findById(routeId);
      const { typeCarId } = await Car.findById(carId);
      const departure = routeChoose.departure._id;
      const destination = routeChoose.destination._id;
      const priceCheck = await vehicleRouteService.checkPriceRoute(
        startDate,
        routeId,
        typeCarId
      );
      console.log(priceCheck);
      if (priceCheck) {
        const route = await vehicleRouteService.addRoutes(
          startDate,
          startTimeId,
          departure,
          destination,
          routeChoose.intendTime,
          carId,
          endDate
        );
        return res.json({ route, message });
      } else {
        return res.json({
          route: null,
          message: "Price  is not exist in this route and carType",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async searchVehicleRoute(req, res, next) {
    const { departure, destination, startDate } = req.body;
    let vehicleRouteSearch = [];
    try {
      const vehicleRoute = await vehicleRouteService.findVehicleRoute(
        departure,
        destination
      );
      const { _id, intendTime, routeType } = await Route.findOne({
        "departure._id": ObjectId(departure),
        "destination._id": ObjectId(destination),
      });
      const promotion = await vehicleRouteService.checkPromotionsRoute(
        startDate
      );

      for (const route of vehicleRoute) {
        if (
          new Date(route.startDate).toLocaleDateString() ===
          new Date(req.body.startDate).toLocaleDateString()
        ) {
          const price = await vehicleRouteService.checkPriceRoute(
            startDate,
            _id,
            route.carTypeId
          );
          const arrayPromotions = [];
          if (promotion.promotion.length > 0) {
            for (const elem of promotion.promotion) {
              if (
                elem.promotionLine.routeTypeId === routeType ||
                elem?.promotionLine.routeTypeId == null
              ) {
                arrayPromotions.push({ ...elem });
              }
            }
            vehicleRouteSearch.push({
              ...route,
              intendTime,
              priceId: price._id,
              price: price.price,
              promotion: arrayPromotions,
            });
          } else {
            vehicleRouteSearch.push({
              ...route,
              intendTime,
              priceId: price._id,
              price: price.price,
              promotion: arrayPromotions,
            });
          }
        }
      }

      res.json(vehicleRouteSearch);
    } catch (error) {
      next(error);
    }
  }
  async addDepartureTime(req, res, next) {
    const { code, time } = req.body;

    try {
      const departureTime = new DepartureTime({
        code: code,
        time: time,
      });
      const newDepartureTime = await departureTime.save();

      res.json(newDepartureTime);
    } catch (error) {
      next(error);
    }
  }
  async addRouteType(req, res, next) {
    const { code, type, description } = req.body;

    try {
      const departureTime = new RouteType({
        code: code,
        type: type,
        description: description,
      });
      const newDepartureTime = await departureTime.save();

      res.json(newDepartureTime);
    } catch (error) {
      next(error);
    }
  }
  // get ds car khong trung voi tuyen, ngay bat dau, va gio xuat ben
  async getCarRoute(req, res, next) {
    const { startDate, startTimeId, routeId } = req.body;

    try {
      const result = await vehicleRouteService.getListCarbyStartTime(
        startDate,
        startTimeId,
        routeId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  //get all Vehicle routes by idRoute
  async getVehicleRoute(req, res, next) {
    const { routeId } = req.params;
    let vehicleRouteSearch = [];
    const { departure, destination, intendTime, routeType } =
      await Route.findById(routeId);
    try {
      const vehicleRoute = await vehicleRouteService.findVehicleRoute(
        departure._id,
        destination._id
      );

      for (const route of vehicleRoute) {
        const price = await vehicleRouteService.checkPriceRoute(
          route.startDate,
          routeId,
          route.carTypeId
        );
        const promotion = await vehicleRouteService.checkPromotionsRoute(
          route.startDate
        );
        const arrayPromotions = [];
        if (promotion.promotion.length > 0) {
          for (const elem of promotion.promotion) {
            if (
              elem.promotionLine.routeTypeId === routeType ||
              elem?.promotionLine.routeTypeId == null
            ) {
              arrayPromotions.push({ ...elem });
            }
          }
          vehicleRouteSearch.push({
            ...route,
            intendTime,
            priceId: price._id,
            price: price.price,
            promotion: arrayPromotions,
          });
        } else {
          vehicleRouteSearch.push({
            ...route,
            intendTime,
            priceId: price._id,
            price: price.price,
            promotion: arrayPromotions,
          });
        }
      }

      res.json(vehicleRouteSearch);
    } catch (error) {
      next(error);
    }
  }
  // get list ticket and list chair vehicle by id vehicle
  async getListTicketByIdVehicleRoute(req, res, next) {
    const { vehicleId } = req.params;

    let vehicleRouteSearch = {};
    try {
      const vehicleRoute = await vehicleRouteService.getInfoVehicleById(
        vehicleId
      );
      const vehicle = vehicleRoute[0];
      console.log(vehicle.departure);
      const { _id, intendTime, routeType } = await Route.findOne({
        "departure._id": ObjectId(vehicle.departure._id),
        "destination._id": ObjectId(vehicle.destination._id),
      });
      const price = await vehicleRouteService.checkPriceRoute(
        vehicle.startDate,
        _id,
        vehicle.carTypeId
      );
      const promotion = await vehicleRouteService.checkPromotionsRoute(
        vehicle.startDate
      );

      const listTicketUser = await ticketService.getTicketByVehicleRouteId(
        vehicleId
      );

      const arrayPromotions = [];
      if (promotion.promotion.length > 0) {
        for (const elem of promotion.promotion) {
          if (
            elem.promotionLine.routeTypeId === routeType ||
            elem?.promotionLine.routeTypeId == null
          ) {
            arrayPromotions.push({ ...elem });
          }
        }
        vehicleRouteSearch = {
          vehicle,
          intendTime,
          priceId: price._id,
          price: price.price,
          promotion: arrayPromotions,
          listTicketUser,
        };
      } else {
        vehicleRouteSearch = {
          vehicle,
          intendTime,
          priceId: price._id,
          price: price.price,
          promotion: arrayPromotions,
          listTicketUser,
        };
      }

      res.json(vehicleRouteSearch);
    } catch (error) {
      next(error);
    }
  }
  // get list vehicleRoute unique by start date and departure,destination (quan ly chhuyen xe)
  async getListVehicleRouteCurrenDate(req, res, next) {
    const { page, size } = req.query;

    // departure_id, destination_id, startDate
    const { depId, desId, date } = req.query;

    let arrrayFinal = [];
    const a = new Date().toLocaleDateString();
    console.log(a);
    try {
      var vehicleRoute = await VehicleRoute.find({
        startDate: { $gte: new Date(a) },
      }).sort({ startDate: 1 });

      let cachedObject = {};
      vehicleRoute.map(
        (item) => (cachedObject[item.startDate] = item.startDate)
      );
      vehicleRoute = Object.values(cachedObject);
      for (const elem of vehicleRoute) {
        var listVehiceDate = await vehicleRouteService.getInfoVehicleCurrenDate(
          elem
        );
        for (var i = 0; i < listVehiceDate.length - 1; i++) {
          for (var j = i + 1; j < listVehiceDate.length; j++) {
            if (
              listVehiceDate[i].departure._id.toString() ===
                listVehiceDate[j].departure._id.toString() &&
              listVehiceDate[i].destination._id.toString() ===
                listVehiceDate[j].destination._id.toString()
            ) {
              listVehiceDate.splice(j, 1);
            }
          }
        }
        arrrayFinal.push(...listVehiceDate);
      }

      const { arrPagination, totalPages } = await utilService.pagination(
        parseInt(page),
        parseInt(size),
        arrrayFinal
      );
      if (desId !== "" && depId !== "" && date !== null) {
        const listVehiceDate = [];
        arrrayFinal.forEach((element) => {
          if (
            element.destination._id.toString() == desId &&
            element.departure._id.toString() == depId &&
            new Date(element.startDate).toLocaleDateString() ===
              new Date(date).toLocaleDateString()
          ) {
            listVehiceDate.push(element);
          }
        });
        res.json({ listVehice: listVehiceDate, totalPages });
      } else {
        res.json({ listVehice: arrPagination, totalPages });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleRouteController();
