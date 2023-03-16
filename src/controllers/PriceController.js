const priceService = require("../services/PriceService");
const Price = require("../modal/Price");
const PriceHeader = require("../modal/PriceHeader");
const ObjectId = require("mongoose").Types.ObjectId;

class PriceController {
  async addPriceHeader(req, res, next) {
    var { startDate, endDate, title } = req.body;
    var status;

    const codeFind = await PriceHeader.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    try {
      if (new Date(startDate) > new Date()) {
        status = false;
      } else {
        status = true;
      }
      let data = {
        startDate: startDate,
        endDate: endDate,
        title: title,
        status: status,
        code: code + 1,
      };
      const priceCheck = await priceService.checDatePrice(startDate);
      console.log(priceCheck);
      if (priceCheck) {
        res.json({ priceHeader: null, message: "priceHeader Is exists" });
      } else {
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

    const codeFind = await Price.find().sort({ _id: -1 }).limit(1);
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
      const priceRoute = await priceService.checkPriceRoute(
        routeId,
        priceHeaderId,
        carTypeId
      );
      if (priceRoute) {
        res.json({ price: null, message: "price Is exists" });
      } else {
        const price = new Price(data);
        await price.save();
        res.json({ price, message: "Success" });
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

            route: "$route",
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
      }
      res.json(priceHeader);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PriceController();
