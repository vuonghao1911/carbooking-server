const vehicleRouteService = require("../services/VehicleRouteService");
const ticketService = require("../services/TicketService");
const Customer = require("../modal/Customer");
const ObjectId = require("mongoose").Types.ObjectId;
const Route = require("../modal/Route");
const RouteType = require("../modal/RouteType");
const VehicleRoute = require("../modal/VehicleRoute");
const DepartureTime = require("../modal/DepartureTime");
class VehicleRouteController {
  async addVehicleRoute(req, res, next) {
    const { startDate, startTimeId, routeId, carId, endDate } = req.body;
    console.log(routeId);
    try {
      const routeChoose = await Route.findById(routeId);
      const departure = routeChoose.departure._id;
      const destination = routeChoose.destination._id;
      const route = await vehicleRouteService.addRoutes(
        startDate,
        startTimeId,
        departure,
        destination,
        routeChoose.intendTime,
        carId,
        endDate
      );
      return res.json(route);
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

      for (const route of vehicleRoute) {
        console.log(
          "Vehicle",
          new Date(route.startDate).toLocaleDateString(),
          new Date(req.body.startDate).toLocaleDateString()
        );
        if (
          new Date(route.startDate).toLocaleDateString() ===
          new Date(req.body.startDate).toLocaleDateString()
        ) {
          const price = await vehicleRouteService.checkPriceRoute(
            startDate,
            _id,
            route.carTypeId
          );
          const promotion = await vehicleRouteService.checkPromotionsRoute(
            startDate
          );
          if (promotion?.promotionLine.routeTypeId) {
            if (promotion.promotionLine.routeTypeId === routeType) {
              vehicleRouteSearch.push({
                ...route,
                intendTime,
                priceId: price._id,
                price: price.price,
                promotion,
              });
            } else {
              vehicleRouteSearch.push({
                ...route,
                intendTime,
                priceId: price._id,
                price: price.price,
                promotion: null,
              });
            }
          } else {
            vehicleRouteSearch.push({
              ...route,
              intendTime,
              priceId: price._id,
              price: price.price,
              promotion,
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
        if (promotion?.promotionLine.routeTypeId) {
          if (promotion.promotionLine.routeTypeId === routeType) {
            vehicleRouteSearch.push({
              ...route,
              intendTime,
              priceId: price._id,
              price: price.price,
              promotion,
            });
          } else {
            vehicleRouteSearch.push({
              ...route,
              intendTime,
              priceId: price._id,
              price: price.price,
              promotion: null,
            });
          }
        } else {
          vehicleRouteSearch.push({
            ...route,
            intendTime,
            priceId: price._id,
            price: price.price,
            promotion,
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

      if (promotion?.promotionLine.routeTypeId) {
        if (promotion.promotionLine.routeTypeId === routeType) {
          vehicleRouteSearch = {
            vehicle,
            intendTime,
            price: price.price,
            promotion,
            listTicketUser,
          };
        } else {
          vehicleRouteSearch = {
            vehicle,
            intendTime,
            price: price.price,
            promotion: null,
            listTicketUser,
          };
        }
      } else {
        vehicleRouteSearch = {
          vehicle,
          intendTime,
          price: price.price,
          promotion,
          listTicketUser,
        };
      }

      res.json(vehicleRouteSearch);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleRouteController();
