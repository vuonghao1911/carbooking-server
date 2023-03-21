const priceService = require("../services/PriceService");
const Price = require("../modal/Price");
const PriceHeader = require("../modal/PriceHeader");
const ObjectId = require("mongoose").Types.ObjectId;

class PriceController {
  async addPriceHeader(req, res, next) {
    var { startDate, endDate, title } = req.body;
    var status;
    var message = "startDate >= Current Date";
    const codeFind = await PriceHeader.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    try {
      if (new Date(startDate) < new Date()) {
        res.json({ priceHeader: null, message: message });
      } else {
        let data = {
          startDate: startDate,
          endDate: endDate,
          title: title,
          status: status,
          code: code + 1,
        };

        const priceHeader = new PriceHeader(data);
        await priceHeader.save();
        res.json({ priceHeader, message: "Success" });
      }
    } catch (error) {
      next(error);
    }
  }
  async addPrice(req, res, next) {
    var { routeId, price, priceHeaderId, carTypeId } = req.body;
    var checkUnique = true;
    const codeFind = await Price.find().sort({ _id: -1 }).limit(1);
    const priceHeader = await PriceHeader.findById(priceHeaderId);
    const listpriceHeaer = await priceService.checkDatePrice(
      priceHeader.startDate
    );
    for (const elem of listpriceHeaer) {
      const priceCheck = await priceService.checkPriceRoute(
        routeId,
        elem._id,
        carTypeId
      );
      if (priceCheck) {
        checkUnique = false;
        break;
      }
    }
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    let data = {
      routeId: routeId,
      price: price,
      priceHeaderId: priceHeaderId,
      carTypeId: carTypeId,
      code: code + 1,
    };
    try {
      if (checkUnique) {
        const price = new Price(data);
        await price.save();
        res.json({ price, message: "Success" });
      } else {
        res.json({ price: null, message: "price Is exists" });
      }
    } catch (error) {
      next(error);
    }
  }
  async getPriceByIdHeader(req, res, next) {
    const { priceHeaderId } = req.params;
    try {
      const price = await Price.aggregate([
        {
          $match: {
            priceHeaderId: ObjectId(priceHeaderId),
          },
        },
        {
          $lookup: {
            from: "routes",
            localField: "routeId",
            foreignField: "_id",
            as: "route",
          },
        },
        {
          $unwind: "$route",
        },
        {
          $lookup: {
            from: "cartypes",
            localField: "carTypeId",
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

            price: "$price",

            route: {
              _id: "$route._id",
              intendTime: "$route.intendTime",
              routeType: "$route.routeType",
              departure: {
                _id: "$route.departure._id",
                name: "$route.departure.name",
              },
              destination: {
                _id: "$route.destination._id",
                name: "$route.destination.name",
              },
              code: "$route.code",
            },
            cartype: {
              _id: 1,
              type: 1,
            },
            priceHeaderId: "$priceHeaderId",
          },
        },
      ]);
      res.json(price);
    } catch (error) {
      next(error);
    }
  }
  async getPriceHeader(req, res, next) {
    try {
      const priceHeader = await PriceHeader.find();
      for (const priceHd of priceHeader) {
        if (new Date(priceHd.endDate) < new Date()) {
          await PriceHeader.updateOne(
            { _id: priceHd._id },
            { $set: { status: false } }
          );
        }
        if (
          new Date(priceHd.startDate) <= new Date() &&
          new Date(priceHd.endDate) > new Date()
        ) {
          await PriceHeader.updateOne(
            { _id: priceHd._id },
            { $set: { status: true } }
          );
        }
      }
      res.json(priceHeader);
    } catch (error) {
      next(error);
    }
  }
  async updatePriceHeader(req, res, next) {
    const { startDate, endDate, idHeader } = req.body;
    try {
      const priceHeader = await PriceHeader.findById(idHeader);
      console.log(idHeader);
      if (priceHeader.status) {
        if (new Date(startDate) < new Date()) {
          if (new Date(new Date(endDate).toLocaleDateString) < new Date()) {
            res.json({ message: "endate < current date" });
          } else {
            await PriceHeader.updateOne(
              { _id: idHeader },
              { $set: { endDate: endDate } }
            );
          }
          res.json({ message: "update Success with priceStatus true" });
        } else {
          res.json({ message: "status true : --- not update startDate" });
        }
      } else {
        if (
          new Date(startDate) <= new Date() ||
          new Date(endDate) < new Date() ||
          new Date(startDate) < new Date(endDate)
        ) {
          res.json({ message: "startDate and EndDate invalid" });
        } else {
          await PriceHeader.updateOne(
            { _id: idHeader },
            {
              $set: {
                endDate: endDate,

                startDate: startDate,
              },
            }
          );
        }
        res.json({ message: "update Success with priceStatus false" });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PriceController();
