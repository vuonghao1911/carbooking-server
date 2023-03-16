const carService = require("../services/CarService");
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

    console.log(array);

    try {
      const carType = new CarType({ type: type, chair: array });

      const saveCar = await carService.addCarType(carType);
      console.log(saveCar);
      return res.json(saveCar);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCarById(req, res, next) {
    const { id } = req.params;
    console.log(id);

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
  async getCar(req, res, next) {
    try {
      const cars = await Car.aggregate([
        {
          $lookup:
          {
            from: "cartypes",
            localField: "typeCarId",
            foreignField: "_id",
            as: "cartype"
          },
        },
        {
          "$unwind": "$cartype"
        },
        {
          $lookup:
          {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee"
          },
        },
        {
          "$unwind": "$employee"
        },
        {
          "$project": {
            "_id": "$_id",
            "licensePlates": "$licensePlates",
            "carType": "$cartype",
            "employeeFirstName": "$employee.firstName",
            "employeeLastName": "$employee.lastName",
            "chair": {"$size": "$chair"}
          },
        },
      ]);
      res.json(cars);
    } catch (error) {
      next(error);
    }
  }
  async addCar(req, res, next) {
    const { idTypeCar, licensePlates, employeeId } = req.body;

    const { chair } = await CarType.findById(idTypeCar);
    console.log(chair);
    const car = new Car({
      licensePlates: licensePlates,
      typeCarId: idTypeCar,
      employeeId: employeeId,
      chair: chair,
    });

    try {
      const newcar = await carService.addCar(car);
      res.json(newcar);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CarController();
