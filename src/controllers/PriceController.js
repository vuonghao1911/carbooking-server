const priceService = require("../services/PriceService");
const utilsService = require("../utils/utils");
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
      const price = new Price(data);
      await price.save();
      res.json({ price, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getPriceByIdHeader(req, res, next) {
    const { priceHeaderId } = req.params;
    const { page, size } = req.query;

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
        { $sort: { _id: -1 } },
      ]);
      const { arrPagination, totalPages } = await utilsService.pagination(
        parseInt(page),
        parseInt(size),
        price
      );
      res.json({ price: arrPagination, totalPages });
    } catch (error) {
      next(error);
    }
  }
  async getPriceHeader(req, res, next) {
    const { code, startDate = "", endDate = "", status = "", date } = req.query;
    const { page, size } = req.query;
    var priceHeader;
    try {
      if (code) {
        const arrayPriceFind = [];
        priceHeader = await PriceHeader.find({ code: code });

        return res.json({ priceHeader: priceHeader, totalPages: null });
      } else {
        if (page && size) {
          priceHeader = await PriceHeader.find().sort({ _id: -1 });
          const arrayResult = [];
          if (startDate != "" && endDate != "") {
            for (const elem of priceHeader) {
              if (
                new Date(elem.startDate) >= new Date(startDate) &&
                new Date(elem.startDate) <= new Date(endDate)
              ) {
                arrayResult.push(elem);
              }
            }
            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              arrayResult
            );
            return res.json({ priceHeader: arrPagination, totalPages });
          }

          if (status != "") {
            for (const elem of priceHeader) {
              if (elem.status.toString() == status) {
                arrayResult.push(elem);
              }
            }
            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              arrayResult
            );
            return res.json({ priceHeader: arrPagination, totalPages });
          }

          if (date) {
            for (const elem of priceHeader) {
              if (
                new Date(elem.startDate) <= new Date(date) &&
                new Date(elem.endDate) >= new Date(date)
              ) {
                arrayResult.push(elem);
              }
            }
            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              arrayResult
            );

            return res.json({
              priceHeader: arrPagination,
              totalPages: totalPages,
            });
          }
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            priceHeader
          );

          return res.json({ priceHeader: arrPagination, totalPages });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // update price header
  async updatePriceHeader(req, res, next) {
    const { idHeader } = req.body;
    const { startDate = "", endDate = "", status = null } = req.query;

    try {
      const priceHeader = await PriceHeader.findById(idHeader);

      if (status == "false") {
        await PriceHeader.updateOne(
          { _id: idHeader },
          {
            $set: {
              status: status,
            },
          }
        );
        res.json({
          massage: "Cập nhật trạng thái thành công",
        });
      } else if (status === null) {
        if (startDate == "") {
          await PriceHeader.updateOne(
            { _id: idHeader },
            {
              $set: {
                endDate: endDate,
              },
            }
          );
          res.json({
            massage: "Cập nhật ngày kết thúc thành công",
          });
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
          res.json({
            massage: "Cập nhật ngày bắt đầu và ngày kết thúc thành công",
          });
        }
      } else if (status == "true") {
        var priceUnique = false;
        var idPriceHeader = null;
        const priceHeaderCheck = await priceService.checkDatePrice(
          priceHeader.startDate
        );
        for (const header of priceHeaderCheck) {
          const priceCheck = await Price.find({ priceHeaderId: header._id });
          if (priceCheck?.length > 0) {
            for (const pirceDetails of priceCheck) {
              const price = await priceService.checkPriceRoute(
                pirceDetails.routeId,
                pirceDetails.priceHeaderId,
                pirceDetails.carTypeId
              );
              if (price) {
                priceUnique = true;
                idPriceHeader = header._id;
                break;
              }
            }
          }
          if (priceUnique) break;
        }
        if (priceUnique) {
          res.json({
            massage: `Giá đã tồn tại trong bảng giá với id : ${idPriceHeader}`,
          });
        } else {
          await PriceHeader.updateOne(
            { _id: idHeader },
            {
              $set: {
                status: status,
              },
            }
          );
          res.json({
            massage: "Cập nhật trạng thái thành công",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PriceController();
