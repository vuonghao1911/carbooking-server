const promotionService = require("../services/PromotionService");
const awsS3Service = require("../services/AwsS3Service");
const Promotion = require("../modal/Promotion");
const PromotionHeader = require("../modal/PromotionHeader");
const PromotionService = require("../services/PromotionService");
const PromotionType = require("../modal/PromotionType");
const RouteType = require("../modal/RouteType");
const PromotionLine = require("../modal/PromotionLine");
const utilsService = require("../utils/utils");

class PromotionController {
  // add promotion details and promotion line
  async addPromotions(req, res, next) {
    const {
      startDate,
      endDate,
      percentDiscount,
      quantityTicket,
      title,
      purchaseAmount,
      moneyReduced,
      maximumDiscount,
      budget,
      promotionType,
      description,
      promotionHeaderId,
      codeLine,
      routeTypeId,
    } = req.body;

    var status;
    var message = "Success";
    try {
      const codeFindDetails = await PromotionLine.find()
        .sort({ _id: -1 })
        .limit(1);
      var codeDetails;
      if (codeFindDetails[0]) {
        codeDetails = codeFindDetails[0].code;
      } else {
        codeDetails = 0;
      }

      const lineFind = await PromotionLine.findOne({ code: codeLine });
      if (lineFind) {
        return res.json({ message: "Trùng mã khuyễn mãi" });
      }

      const checkDate = await promotionService.checDatePromotionsHeader(
        startDate,
        endDate
      );
      if (checkDate) {
        const promotionLine = new PromotionLine({
          startDate: startDate,
          endDate: endDate,
          title: title,
          code: codeLine,
          title: title,
          promotionTypeId: promotionType,
          promotionHeaderId: promotionHeaderId,
          description: description,
          routeTypeId: routeTypeId,
        });
        const newPromotionLine = await promotionLine.save();
        const promotion = new Promotion({
          percentDiscount: percentDiscount,
          quantityTicket: quantityTicket,
          purchaseAmount: purchaseAmount,
          moneyReduced: moneyReduced,
          maximumDiscount: maximumDiscount,
          budget: budget,
          remainingBudget: budget,
          promotionType: promotionType,
          promotionHeaderId: promotionHeaderId,
          promotionLineId: newPromotionLine._id,
        });

        const newPromotion = await promotion.save();

        res.json({ newPromotionLine, newPromotion, message });
      } else {
        message =
          "startDate and EndDate promotionLine or PromotionDetails invalid ";
        res.json({ newPromotionLine: null, newPromotion: null, message });
      }
    } catch (error) {
      next(error);
    }
  }
  // add promotion header
  async addPromotionHeader(req, res, next) {
    const { startDate, endDate, title, description, code } = req.body;
    const file = req.file;

    try {
      const urlImg = await awsS3Service.uploadFile(file);
      const promotionFind = await PromotionHeader.findOne({ code: code });
      if (promotionFind) {
        return res.json({ message: "Trùng mã khuyến mãi" });
      }

      let data = {
        startDate: startDate,
        endDate: endDate,
        title: title,
        code: code,
        description: description,
        imgUrl: urlImg,
      };
      const promotionsHeader = new PromotionHeader(data);

      await promotionsHeader.save();
      res.json({ promotionsHeader, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  // get all  promotion by header id
  async getPromotion(req, res, next) {
    const { idProHeader } = req.params;
    const result = [];
    try {
      // console.log(promotion[1].promotionLine.startDate);
      const promotionResult =
        await PromotionService.getPromotionDetailsByPromotionHeaderId(
          idProHeader
        );
      for (const elem of promotionResult) {
        var routeType = null;
        if (elem?.promotionLine?.routeTypeId) {
          routeType = await RouteType.findById(
            elem?.promotionLine?.routeTypeId
          );
        }
        result.push({ ...elem, routeType: routeType });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  // add promotion type
  async addPromotionType(req, res, next) {
    const { name } = req.body;

    try {
      const newPro = await PromotionService.savePromotionType(name);
      res.json(newPro);
    } catch (error) {
      next(error);
    }
  }
  // get promotion type
  async getPromotionType(req, res, next) {
    try {
      const promotionType = await PromotionType.find();
      res.json(promotionType);
    } catch (error) {
      next(error);
    }
  }
  // add promotion result
  async addPromotionResult(req, res, next) {
    const { promotionId, ticketId, discountAmount } = req.body;
    const codeFind = await Promotion.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    try {
      const newProResult = await PromotionService.savePromotionResult(
        promotionId,
        ticketId,
        discountAmount
      );
      res.json(newProResult);
    } catch (error) {
      next(error);
    }
  }
  // get promotion curren date
  async getPromotionByCurrentDate(req, res, next) {
    const result = [];
    try {
      const listPromotions = await promotionService.getPromotion();
      for (const elem of listPromotions) {
        var routeType = null;
        if (elem?.promotionLine?.routeTypeId) {
          routeType = await RouteType.findById(
            elem?.promotionLine?.routeTypeId
          );
        }
        result.push({ ...elem, routeType: routeType });
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  // get all promotion header
  async getPromotionHeader(req, res, next) {
    try {
      const {
        page,
        size,
        code,
        startDate = "",
        endDate = "",
        status = "",
      } = req.query;

      var promotionResult;

      if (code) {
        promotionResult = await PromotionHeader.find({ code: code });
        return res.json({ promotionsHeader: promotionResult });
      } else {
        if (page && size) {
          promotionResult = await PromotionHeader.find().sort({ _id: -1 });
          const arrayResult = [];
          if (startDate != "" && endDate != "") {
            for (const elem of promotionResult) {
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
            return res.json({ arrayResult: arrPagination, totalPages });
          }

          if (status != "") {
            for (const elem of promotionResult) {
              if (elem.status.toString() == status) {
                arrayResult.push(elem);
              }
            }
            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              arrayResult
            );
            return res.json({ arrayResult: arrPagination, totalPages });
          }

          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            promotionResult
          );
          return res.json({ promotionsHeader: arrPagination, totalPages });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // update promotion header
  async updatePromotionHeader(req, res, next) {
    const { idHeader } = req.body;
    const { startDate = "", endDate = "", status = null } = req.query;
    console.log(endDate);
    try {
      if (status == "false" || status == "true") {
        await PromotionHeader.updateOne(
          { _id: idHeader },
          {
            $set: {
              status: status,
            },
          }
        );
        res.json({
          massage: `Cập nhật trạng thái khuyễn mãi thành công`,
        });
      } else if (status === null) {
        if (startDate == "") {
          const listPromoLine = await PromotionLine.find({
            promotionHeaderId: idHeader,
            endDate: { $gt: new Date(endDate) },
          });
          if (listPromoLine?.length > 0) {
            for (const elem of listPromoLine) {
              await PromotionLine.updateOne(
                { _id: elem._id },
                {
                  $set: {
                    endDate: endDate,
                  },
                }
              );
            }
          }
          await PromotionHeader.updateOne(
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
          await PromotionHeader.updateOne(
            { _id: idHeader },
            {
              $set: {
                endDate: endDate,
                startDate: startDate,
              },
            }
          );
          res.json({
            massage: "Cập nhật ngày bắt đầu và kết thúc thành công",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  //update promotion line
  async updatePromotionLine(req, res, next) {
    const { idLine } = req.body;
    const { startDate = "", endDate = "", status = null } = req.query;

    try {
      if (status == "false" || status == "true") {
        await PromotionLine.updateOne(
          { _id: idLine },
          {
            $set: {
              status: status,
            },
          }
        );
        res.json({
          massage: `Cập nhật trạng thái khuyến mãi thành công`,
        });
      } else if (status === null) {
        if (startDate == "") {
          await PromotionLine.updateOne(
            { _id: idLine },
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
          await PromotionLine.updateOne(
            { _id: idLine },
            {
              $set: {
                endDate: endDate,
                startDate: startDate,
              },
            }
          );
          res.json({
            massage: "Cập nhật ngày bắt đầu và kết thúc thành công",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // statisticPromotion
  async statisticPromotion(req, res, next) {
    const { page, size, code = "", startDate = "", endDate = "" } = req.query;
    try {
      const promotionLine = await PromotionLine.find();

      const arrayResult = [];
      if (promotionLine?.length > 0) {
        for (const line of promotionLine) {
          const statistic =
            await promotionService.getTotalDiscountAmountByIdPromotionLine(
              line._id
            );
          const routeType = await RouteType.findById(line.routeTypeId);
          const promoDetails = await Promotion.findOne({
            promotionLineId: line._id,
          });

          if (statistic?.length > 0) {
            arrayResult.push({
              Line: line,
              routeType: routeType ? routeType.type : "Tất cả các tuyến",
              statistic: statistic[0],
              budget: promoDetails.budget,
              remainingBudget:
                promoDetails.budget - statistic[0].totalDiscountAmount,
            });
          } else {
            arrayResult.push({
              Line: line,
              routeType: routeType ? routeType.type : "Tất cả các tuyến",
              statistic: {
                totalDiscountAmount: 0,
                count: 0,
              },
              budget: promoDetails?.budget,
              remainingBudget: promoDetails?.budget - 0,
            });
          }
        }
        if (page && size) {
          const array = [];
          if (startDate != "" && endDate != "") {
            for (const elem of arrayResult) {
              if (
                new Date(elem.Line.startDate) >= new Date(startDate) &&
                new Date(elem.Line.endDate) <= new Date(endDate)
              ) {
                array.push(elem);
              }
            }

            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              array
            );
            return res.json({ data: arrPagination, totalPages });
          }

          if (code != "") {
            for (const elem of arrayResult) {
              if (elem.Line.code === code) {
                array.push(elem);
                break;
              }
            }

            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              array
            );
            return res.json({ data: arrPagination, totalPages });
          }
        }

        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayResult
        );
        return res.json({ data: arrPagination, totalPages });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();
