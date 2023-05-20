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
const moment = require("moment");
class VehicleRouteController {
  // save vehicle route
  async addVehicleRoute(req, res, next) {
    const { startDate, startTimeId, routeId, carId, endDate } = req.body;

    var message = "success";
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
      return res.json({ route, message });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  // search vehicle route
  async searchVehicleRoute(req, res, next) {
    const { departure, destination, startDate } = req.body;
    const { admin = false } = req.query;
    let vehicleRouteSearch = [];
    try {
      const vehicleRoute = await vehicleRouteService.findVehicleRoute(
        departure,
        destination
      );
      if (vehicleRoute && vehicleRoute.length > 0) {
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
              route.startDate,
              _id,
              route.carTypeId
            );

            const arrayPromotions = [];
            if (promotion?.promotion?.length > 0) {
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
                priceId: price?._id ? price._id : null,
                price: price?.price ? price?.price : null,
                promotion: arrayPromotions,
              });
            } else {
              vehicleRouteSearch.push({
                ...route,
                intendTime,
                priceId: price?._id ? price._id : null,
                price: price?.price ? price?.price : null,
                promotion: arrayPromotions,
              });
            }
          }
        }
        const currenTime = new Date().getHours() + 7;

        const arrayResult = [];

        for (const elem of vehicleRouteSearch) {
          const routeTime = Number(elem.startTime.substring(0, 2));
          if (
            new Date(elem.startDate).toLocaleDateString() ==
            new Date().toLocaleDateString()
          ) {
            if (routeTime - 1 > currenTime) {
              arrayResult.push(elem);
            }
          } else {
            arrayResult.push(elem);
          }
        }
        if (admin) {
          vehicleRouteSearch.sort((a, b) => {
            return (
              Number(a.startTime.substring(0, 2)) -
              Number(b.startTime.substring(0, 2))
            );
          });
          return res.json(vehicleRouteSearch);
        } else {
          arrayResult.sort((a, b) => {
            return (
              Number(a.startTime.substring(0, 2)) -
              Number(b.startTime.substring(0, 2))
            );
          });

          return res.json(arrayResult);
        }
      } else {
        vehicleRouteSearch.sort((a, b) => {
          return (
            Number(b.startTime.substring(0, 2)) -
            Number(a.startTime.substring(0, 2))
          );
        });
        return res.json(vehicleRouteSearch);
      }
    } catch (error) {
      next(error);
    }
  }
  // add department time
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
  // add route type
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
        if (promotion && promotion.promotion?.length > 0) {
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
            priceId: price?._id ? price._id : null,
            price: price?.price ? price?.price : null,
            promotion: arrayPromotions,
          });
        } else {
          vehicleRouteSearch.push({
            ...route,
            intendTime,
            priceId: price?._id ? price._id : null,
            price: price?.price ? price?.price : null,
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
      if (promotion?.promotion?.length > 0) {
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
          priceId: price?._id ? price._id : null,
          price: price?.price ? price?.price : null,
          promotion: arrayPromotions,
          listTicketUser,
        };
      } else {
        vehicleRouteSearch = {
          vehicle,
          intendTime,
          priceId: price?._id ? price._id : null,
          price: price?.price ? price?.price : null,
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
    const { depId = "", desId = "", date = "" } = req.query;

    let arrrayFinal = [];
    const a = new Date().toLocaleDateString();

    try {
      var vehicleRoute = await VehicleRoute.find().sort({ startDate: -1 });

      let cachedObject = {};
      vehicleRoute.map(
        (item) => (cachedObject[item.startDate] = item.startDate)
      );
      vehicleRoute = Object.values(cachedObject);
      for (const elem of vehicleRoute) {
        var listVehiceDate = await vehicleRouteService.getInfoVehicleCurrenDate(
          elem
        );
        for (var i = 0; i < listVehiceDate?.length - 1; i++) {
          for (var j = i + 1; j < listVehiceDate?.length; j++) {
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
      const listVehiceDateFinal = [];
      if (desId !== "" && depId !== "") {
        if (date !== "") {
          arrrayFinal.forEach((element) => {
            if (
              element.destination._id.toString() == desId &&
              element.departure._id.toString() == depId &&
              new Date(element.startDate).toLocaleDateString() ===
                new Date(date).toLocaleDateString()
            ) {
              listVehiceDateFinal.push(element);
            }
          });
          res.json({ listVehice: listVehiceDateFinal, totalPages });
        } else {
          arrrayFinal.forEach((element) => {
            if (
              element.destination._id.toString() == desId &&
              element.departure._id.toString() == depId
            ) {
              listVehiceDateFinal.push(element);
            }
          });
          res.json({ listVehice: listVehiceDateFinal, totalPages });
        }
      } else if (date !== "") {
        arrrayFinal.forEach((element) => {
          if (
            new Date(element.startDate).toLocaleDateString() ===
            new Date(date).toLocaleDateString()
          ) {
            listVehiceDateFinal.push(element);
          }
        });
        res.json({ listVehice: listVehiceDateFinal, totalPages });
      } else {
        res.json({ listVehice: arrPagination, totalPages });
      }
    } catch (error) {
      next(error);
    }
  }
  // cancle vehicle route
  async cancleVehicleRoute(req, res, next) {
    const { idVehicleRoute, status = false } = req.body;

    try {
      await VehicleRoute.updateOne(
        { _id: idVehicleRoute },
        {
          $set: {
            status: status,
          },
        }
      );

      res.json({ message: "success" });
    } catch (error) {
      next(error);
    }
  }

  // get vehicle route by current date
  async getVehicleRouteByDate(req, res, next) {
    let vehicleRouteSearch = [];
    try {
      const date = moment().utcOffset(420).format("YYYY-MM-DD");
      const vehicleRoute = await vehicleRouteService.getVehicleRouteCurrentDate(
        date
      );

      if (vehicleRoute && vehicleRoute.length > 0) {
        for (const route of vehicleRoute) {
          const { _id, intendTime, routeType } = await Route.findOne({
            "departure._id": ObjectId(route.departure._id),
            "destination._id": ObjectId(route.destination._id),
          });
          const promotion = await vehicleRouteService.checkPromotionsRoute(
            route.startDate
          );

          const price = await vehicleRouteService.checkPriceRoute(
            route.startDate,
            _id,
            route.carTypeId
          );

          const arrayPromotions = [];
          if (promotion?.promotion?.length > 0) {
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
              priceId: price?._id ? price._id : null,
              price: price?.price ? price?.price : null,
              promotion: arrayPromotions,
            });
          } else {
            vehicleRouteSearch.push({
              ...route,
              intendTime,
              priceId: price?._id ? price._id : null,
              price: price?.price ? price?.price : null,
              promotion: arrayPromotions,
            });
          }
        }
        const currenTime = new Date().getHours() + 7;

        const arrayResult = [];
        for (const elem of vehicleRouteSearch) {
          const routeTime = Number(elem.startTime.substring(0, 2));
          if (
            new Date(elem.startDate).toLocaleDateString() ==
            new Date().toLocaleDateString()
          ) {
            if (routeTime - 1 > currenTime) {
              arrayResult.push(elem);
            }
          } else {
            arrayResult.push(elem);
          }
        }
        arrayResult.sort((a, b) => {
          return (
            Number(a.startTime.substring(0, 2)) -
            Number(b.startTime.substring(0, 2))
          );
        });

        return res.json(arrayResult);
      } else {
        vehicleRouteSearch.sort((a, b) => {
          return (
            Number(b.startTime.substring(0, 2)) -
            Number(a.startTime.substring(0, 2))
          );
        });
        return res.json(vehicleRoute);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleRouteController();
