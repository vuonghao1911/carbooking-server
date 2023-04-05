const placeService = require("../services/PlaceService");
const utilsService = require("../utils/utils");
const Place = require("../modal/Place");
const Route = require("../modal/Route");

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
      console.log(saveplace);
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
    console.log(userId);

    try {
      const customer = await Customer.findById(userId);

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  async getPlace(req, res, next) {
    const { page, size, code } = req.query;
    try {
      const place = await Place.find().sort({ _id: -1 });

      const placeFind = await Place.find({ code: code });
      if (placeFind) {
        return res.json({ data: placeFind, totalPages: null });
      }

      const { arrPagination, totalPages } = await utilsService.pagination(
        parseInt(page),
        parseInt(size),
        place
      );
      return res.json({ data: arrPagination, totalPages });
    } catch (error) {
      next(error);
    }
  }
  async getRoute(req, res, next) {
    const { departure_id, destination_id } = req.query;
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
    const { idroute, intendTime, routeTypeId } = req.body;

    try {
      await Route.updateOne(
        {
          _id: idroute,
        },
        {
          $set: {
            intendTime: intendTime,

            routeType: routeTypeId,
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
}

module.exports = new PlaceController();
