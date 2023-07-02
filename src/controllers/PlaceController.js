const placeService = require("../services/PlaceService");
const utilsService = require("../utils/utils");
const statictisService = require("../services/StatisticService");
const Place = require("../modal/Place");
const Route = require("../modal/Route");
const CarType = require("../modal/CarType");
const ObjectId = require("mongoose").Types.ObjectId;

class PlaceController {
  async addPlace(req, res, next) {
    const { name, busStation, code } = req.body;
    //console.log(number);
    try {
      const place = new Place({
        name: name,
        busStation: busStation,
        code: code,
      });

      const placeFind = await Place.findOne({ code: code });
      if (placeFind) {
        return res.json({ message: "Trùng mã" });
      }

      const saveplace = await placeService.savePlace(place);

      return res.json(saveplace);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async addRoute(req, res, next) {
    const { intendTime, departureId, destinationId, code, routeTypeId } =
      req.body;
    //console.log(number);

    // const Arrayplace = await Promise.all(
    //   placeId.map((e) => {
    //     const place = Place.findById(e.id);
    //     return place;
    //   })
    // );
    const departure = await Place.findById(departureId);
    const destination = await Place.findById(destinationId);

    try {
      const route = new Route({
        intendTime: intendTime,
        departure: departure,
        destination: destination,
        code: code,
        routeType: routeTypeId,
      });
      const saveRoute = await placeService.saveRoute(route);
      return res.json(saveRoute);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCustomerById(req, res, next) {
    const { userId } = req.params;

    try {
      const customer = await Customer.findById(userId);

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  async getPlace(req, res, next) {
    const { page, size, code = "", admin = false } = req.query;
    try {
      var place = [];
      if (admin) {
        place = await Place.find();
      } else {
        place = await Place.find({ status: true });
      }

      place.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      if (code != "") {
        const placeFind = await Place.find({ code: code });
        if (placeFind.length > 0) {
          return res.json({ data: placeFind, totalPages: null });
        } else {
          return res.json({ data: [], totalPages: null });
        }
      }

      if (page && size) {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          place
        );
        return res.json({ data: arrPagination, totalPages });
      } else {
        return res.json({ data: place, totalPages: null });
      }
    } catch (error) {
      next(error);
    }
  }
  async getRoute(req, res, next) {
    const { departure_id, destination_id } = req.query;
    const user = req.user;
    console.log("user", user);
    try {
      const result = [];
      const route = await Route.aggregate([
        {
          $lookup: {
            from: "routetypes",
            localField: "routeType",
            foreignField: "_id",
            as: "routetypes",
          },
        },
        { $unwind: "$routetypes" },
        {
          $project: {
            _id: "$_id",
            routeType: "$routetypes.type",
            intendTime: "$intendTime",
            departure: "$departure",
            destination: "$destination",
            status: "$status",
            code: "$code",
          },
        },
        { $sort: { _id: -1 } },
      ]);
      if (departure_id != null && destination_id != null) {
        for (const elem of route) {
          if (
            elem.departure._id.toString() == departure_id &&
            elem.destination._id.toString() == destination_id
          ) {
            result.push(elem);
            break;
          }
        }
      } else {
        result.push(...route);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  // add busStation
  async addBusStation(req, res, next) {
    const { idPlace, address } = req.body;

    try {
      const place = await Place.findById(idPlace);
      if (place) {
        await Place.updateOne(
          {
            _id: idPlace,
          },
          {
            $push: {
              busStation: { address: address },
            },
          }
        );
        res.json({ message: "Update Success" });
      } else {
        res.json({ message: "Update false : place not found" });
      }
    } catch (error) {
      next(error);
    }
  }
  // update route
  async updateRoute(req, res, next) {
    const { idroute, intendTime, routeTypeId, status } = req.body;

    try {
      await Route.updateOne(
        {
          _id: idroute,
        },
        {
          $set: {
            intendTime: intendTime,
            routeType: routeTypeId,
            status: status,
          },
        }
      );
      res.json({ message: "Update Success" });
    } catch (error) {
      next(error);
    }
  }
  // delete BusStation
  async deleteBusStation(req, res, next) {
    const { idPlace, idAddress } = req.body;

    try {
      await Place.updateOne(
        {
          _id: idPlace,
        },
        {
          $pull: {
            busStation: {
              _id: idAddress,
            },
          },
        }
      );
      res.json({ message: "Update Success" });
    } catch (error) {
      next(error);
    }
  }

  // statictis route by date
  async statictisRouteByDate(req, res, next) {
    const { startDate, endDate, code = "", page, size } = req.query;
    try {
      const qntRoute = await statictisService.countStatictisVehicleRoute(
        startDate,
        endDate
      );

      const qntTicketRoute =
        await statictisService.countStatictisTicketVehicleRoute(
          startDate,
          endDate
        );
      const array = [];
      if (qntRoute && qntRoute.length > 0) {
        for (const elem of qntRoute) {
          const route = await Route.findOne(
            {
              "departure._id": elem._id.departure,
              "destination._id": elem._id.destination,
            },
            { "departure.busStation": 0, "destination.busStation": 0 }
          );
          array.push({
            ...elem,
            route: route,
            routeName: `${route.departure.name} - ${route.destination.name}`,
          });
        }
      }
      if (qntTicketRoute && qntTicketRoute.length > 0) {
        for (const elem of qntTicketRoute) {
          const route = await Route.findOne(
            {
              "departure._id": elem._id.departure,
              "destination._id": elem._id.destination,
            },
            { "departure.busStation": 0, "destination.busStation": 0 }
          );
          var totalAmount = 0;
          var totalDiscount = 0;
          var total = 0;
          if (elem.ticket && elem.ticket.length > 0) {
            for (const ticket of elem.ticket) {
              totalAmount += await utilsService.totalAmountTicket(
                ticket.chair,
                ticket.price,
                ticket.promotionResult
              );

              totalDiscount += await utilsService.totalDiscount(
                ticket.promotionResult
              );
              total += ticket.price * ticket.chair?.length;
            }
          }
          array.push({
            statictisTicket: {
              totalAmount,
              countTicket: elem.countTicket,
              totalDiscount,
              totalBeforDiscout: total,
            },
            route: route,
            routeName: `${route.departure.name} - ${route.destination.name}`,
          });
        }
      }
      const result = array.reduce((array, item) => {
        array[item.route._id] = array[item.route._id] || [];
        array[item.route._id].push(item);
        return array;
      }, Object.create(null));

      const propertyValues = Object.values(result);
      const arrayGroup = [];
      if (propertyValues.length > 0 && propertyValues) {
        for (const elem of propertyValues) {
          if (elem.length == 1) {
            arrayGroup.push({
              ...elem[0],
              statictisTicket: {
                totalAmount: 0,
                countTicket: 0,
                totalDiscount: 0,
                totalBeforDiscout: 0,
              },
            });
          } else {
            const array = [];
            array.push({ ...elem[0], ...elem[1] });
            arrayGroup.push(...array);
          }
        }
      }
      const arrayStatistic = [];

      if (arrayGroup.length > 0 && arrayGroup) {
        for (const elem of arrayGroup) {
          const ticketRefund =
            await statictisService.countStatictisTicketRefundsVehicleRoute(
              startDate,
              endDate,
              elem._id.departure,
              elem._id.destination
            );
          if (ticketRefund.length > 0 && ticketRefund) {
            arrayStatistic.push({
              ...elem,
              quantityTicketRefunds: ticketRefund[0].countTicket,
              totalAmountRefund: ticketRefund[0].totalAmountRefund,
              quantityTicket:
                elem.statictisTicket.countTicket - ticketRefund[0].countTicket,
              totalAmountTicket:
                elem.statictisTicket.totalAmount -
                ticketRefund[0].totalAmountRefund,
            });
          } else {
            arrayStatistic.push({
              ...elem,
              quantityTicketRefunds: 0,
              totalAmountRefund: 0,
              quantityTicket: elem.statictisTicket.countTicket,
              totalAmountTicket: elem.statictisTicket.totalAmount,
            });
          }
          // console.log(ticketRefund);
        }
      }
      arrayStatistic.sort((a, b) => {
        return b.count - a.count;
      });

      if (code != "") {
        const arrayFilter = [];
        for (const elem of arrayStatistic) {
          if (elem.route.code === code) arrayFilter.push(elem);
          break;
        }
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayFilter
        );
        return res.json({
          data: arrPagination,
          message: "success",
          totalPages,
        });
      }
      const { arrPagination, totalPages } = await utilsService.pagination(
        parseInt(page),
        parseInt(size),
        arrayStatistic
      );

      res.json({ data: arrPagination, message: "success", totalPages });
    } catch (error) {
      next(error);
    }
  }

  // statictis cartype by date
  async statisticCartypeByDate(req, res, next) {
    const { startDate, endDate, code = "" } = req.query;
    try {
      const listRefundsByCarType =
        await statictisService.countTicketRefundTypeChairByDate(
          startDate,
          endDate
        );
      const listResult = [];
      if (listRefundsByCarType.length > 0 && listRefundsByCarType) {
        for (const elem of listRefundsByCarType) {
          const qntTicket = await statictisService.countTicketTypeChairByDate(
            startDate,
            endDate,
            elem._id
          );
          const carType = await CarType.findById(elem._id);

          listResult.push({
            quantityTicketRefund: elem.countTicketRefund,
            quantityTicket: qntTicket[0].countTicket,
            carType: carType.type,
            code: carType.code,
          });
        }
      }
      if (code != "") {
        const listFilter = [];
        for (const elem of listResult) {
          if (elem.code === code) {
            listFilter.push(elem);
            break;
          }
        }
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          listFilter
        );
        return res.json({
          data: arrPagination,
          message: "success",
          totalPages,
        });
      }
      const { arrPagination, totalPages } = await utilsService.pagination(
        parseInt(page),
        parseInt(size),
        listResult
      );
      res.json({ data: arrPagination, message: "success", totalPages });
    } catch (error) {
      next(error);
    }
  }

  // update status place
  async updateStatusPlace(req, res, next) {
    const { idPlace, status } = req.body;

    try {
      const route = await Route.find({
        $or: [
          { "departure._id": ObjectId(idPlace) },
          { "destination._id": ObjectId(idPlace) },
        ],
      });

      var checkUpdate = true;

      if (route && route.length > 0) {
        for (const elem of route) {
          if (elem.status) {
            checkUpdate = false;
            break;
          }
        }
      }
      if (checkUpdate) {
        await Place.updateOne(
          {
            _id: idPlace,
          },
          {
            $set: {
              status: status,
            },
          }
        );
        return res.json({ statusUpdate: true, message: "Update Success" });
      } else {
        return res.json({
          statusUpdate: false,
          message:
            " Hủy địa điểm không thành công do địa điểm này có tuyến đang hoạt động",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlaceController();
