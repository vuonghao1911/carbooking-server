const placeService = require("../services/PlaceService");
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

      const saveplace = await placeService.savePlace(place);
      console.log(saveplace);
      return res.json(saveplace);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async addRoute(req, res, next) {
    const {
      carTypeId,
      intendTime,
      departureId,
      destinationId,
      code,
      routeTypeId,
    } = req.body;
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
        carTypeId: carTypeId,
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
    try {
      const place = await Place.find();
      res.json(place);
    } catch (error) {
      next(error);
    }
  }
  async getRoute(req, res, next) {
    try {
      const route = await Route.aggregate([
        {
          $lookup: {
            from: "cartypes",
            localField: "carTypeId",
            foreignField: "_id",
            as: "cartype",
          },
        },
        { $unwind: "$cartype" },
        {
          $project: {
            _id: "$_id",
            carType: "$cartype.type",
            intendTime: "$intendTime",
            route: "$route",
            departure: "$departure",
            destination: "$destination",
            status: "$status",
            code: "$code",
          },
        },
      ]);
      res.json(route);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlaceController();
