const carService = require("../services/CarService");
const utilsService = require("../utils/utils");
const Car = require("../modal/Car");
const CarType = require("../modal/CarType");
class CarController {
  async addCarType(req, res, next) {
    const { type } = req.body;
    //console.log(number);
    var array = [];
    for (var i = 1; i < 19; i++) {
      var seats = "A-0" + i;
      if (i > 9) {
        seats = "A-" + i;
      }
      array.push({ seats: seats, status: false });
    }
    for (var i = 1; i < 19; i++) {
      var seats = "B-0" + i;
      if (i > 9) {
        seats = "B-" + i;
      }
      array.push({ seats: seats, status: false });
    }

    try {
      const carType = new CarType({ type: type, chair: array });

      const saveCar = await carService.addCarType(carType);

      return res.json(saveCar);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCarById(req, res, next) {
    const { id } = req.params;

    try {
      const customer = await carService.getCarById(id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  async getCarType(req, res, next) {
    try {
      const carType = await carService.getCarType(req, res, next);
      res.json(carType);
    } catch (error) {
      next(error);
    }
  }
  // get all car by query params page, size, typeId
  async getCar(req, res, next) {
    const { page, size, typeId } = req.query;
    try {
      const cars = await Car.aggregate([
        {
          $lookup: {
            from: "cartypes",
            localField: "typeCarId",
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
            licensePlates: "$licensePlates",
            carType: {
              _id: "$cartype._id",
              type: "$cartype.type",
            },
            status: "$status",
            description: "$description",
            purchaseDate: "$purchaseDate",
            chair: { $size: "$chair" },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      if (typeId) {
        const arrayCarFind = [];
        for (const elem of cars) {
          if (elem.carType._id == typeId) {
            arrayCarFind.push(elem);
          }
        }
        res.json({ data: arrayCarFind, totalPages: null });
      } else {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          cars
        );

        res.json({ data: arrPagination, totalPages });
      }
    } catch (error) {
      next(error);
    }
  }
  async addCar(req, res, next) {
    const { idTypeCar, licensePlates, description, purchaseDate } = req.body;

    const { chair } = await CarType.findById(idTypeCar);

    const car = new Car({
      licensePlates: licensePlates,
      typeCarId: idTypeCar,
      chair: chair,
      description: description,
      purchaseDate: purchaseDate,
    });

    try {
      const newcar = await carService.addCar(car);
      res.json(newcar);
    } catch (error) {
      next(error);
    }
  }
  // get vehicle by id car query params page size
  async getVehicleByCarId(req, res, next) {
    const { id } = req.params;
    const { page, size } = req.query;
    try {
      const listVehcle = await carService.findVehicleRouteByIdCar(id);
      if (listVehcle?.length > 0) {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          listVehcle
        );

        res.json({ data: arrPagination, totalPages, message: "success" });
      } else {
        res.json({ listVehcle: [], message: "This car has no trips" });
      }
    } catch (error) {
      next(error);
    }
  }
  // update car
  async updateCar(req, res, next) {
    const { idCar, licensePlates, description, purchaseDate, status } =
      req.body;

    try {
      await Car.updateOne(
        { _id: idCar },
        {
          $set: {
            licensePlates: licensePlates,
            description: description,
            purchaseDate: purchaseDate,
            status: status,
          },
        }
      );

      res.json({ message: "success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CarController();
