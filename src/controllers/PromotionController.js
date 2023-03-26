const promotionService = require("../services/PromotionService");
const awsS3Service = require("../services/AwsS3Service");
const Promotion = require("../modal/Promotion");
const PromotionHeader = require("../modal/PromotionHeader");
const PromotionService = require("../services/PromotionService");
const PromotionType = require("../modal/PromotionType");
const RouteType = require("../modal/RouteType");
const PromotionLine = require("../modal/PromotionLine");

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

    const codeFindDetails = await PromotionLine.find()
      .sort({ _id: -1 })
      .limit(1);
    var codeDetails;
    if (codeFindDetails[0]) {
      codeDetails = codeFindDetails[0].code;
    } else {
      codeDetails = 0;
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
  }
  catch(error) {
    next(error);
  }
  // add promotion header
  async addPromotionHeader(req, res, next) {
    const { startDate, endDate, title, description, code } = req.body;
    const file = req.file;

    try {
      const urlImg = await awsS3Service.uploadFile(file);

      let data = {
        startDate: startDate,
        endDate: endDate,
        title: title,
        code: code,
        description: description,
        imgUrl: urlImg,
      };
      const promotionCheck =
        await promotionService.checkDateisExistPromotionsHeader(startDate);
      console.log(promotionCheck);
      if (promotionCheck) {
        res.json({
          promotionsHeader: null,
          message: "promotionHeader Is exists",
        });
      } else {
        const promotionsHeader = new PromotionHeader(data);
        await promotionsHeader.save();
        res.json({ promotionsHeader, message: "Success" });
      }
    } catch (error) {
      next(error);
    }
  }

  async getPromotion(req, res, next) {
    const { idProHeader } = req.params;
    const result = [];
    try {
      const promotion =
        await PromotionService.getPromotionDetailsByPromotionHeaderId(
          idProHeader
        );
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
  async addPromotionType(req, res, next) {
    const { name } = req.body;

    try {
      const newPro = await PromotionService.savePromotionType(name);
      res.json(newPro);
    } catch (error) {
      next(error);
    }
  }
  async getPromotionType(req, res, next) {
    try {
      const promotionType = await PromotionType.find();
      res.json(promotionType);
    } catch (error) {
      next(error);
    }
  }
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
  async getPromotionHeader(req, res, next) {
    try {
      const { code } = req.query;

      var promotionResult;
      const promotionHeader = await PromotionHeader.find();

      //check date > current date update status
      for (const promotionHe of promotionHeader) {
        if (new Date(promotionHe.endDate) < new Date()) {
          await PromotionHeader.updateOne(
            { _id: promotionHe._id },
            { $set: { status: false } }
          );
        }
      }
      if (code) {
        promotionResult = await PromotionHeader.find({ code: code });
      } else {
        promotionResult = await PromotionHeader.find().sort({ _id: -1 });
      }
      res.json(promotionResult);
    } catch (error) {
      next(error);
    }
  }
  async updatePromotionHeader(req, res, next) {
    const { startDate, endDate, status, id } = req.body;
    var message = "status: active -- not update";
    const promoHeader = await PromotionHeader.findById(id);
    const promoLine = await PromotionLine.find({
      promotionHeaderId: promoHeader._id,
    });
    console.log(promoLine);
    try {
      if (
        new Date(promoHeader.endDate) >= new Date() &&
        new Date(promoHeader.startDate) <= new Date()
      ) {
        if (new Date(new Date(endDate).toLocaleDateString) < new Date()) {
          message = "update false : endDate < currendate ";
          res.json(message);
        } else if (new Date(startDate) > new Date()) {
          message = "update false: promotion Actice ---not update StartDate ";
          res.json(message);
        } else {
          await promotionService.updatePromotionHeader(status, endDate, id);

          message = "update success ";
          res.json(message);
        }
      } else {
        if (
          new Date(startDate) < new Date() ||
          new Date(endDate) < new Date()
        ) {
          message =
            "update false : startDate < currendate || endDate < currendate";
          res.json(message);
        }
        await promotionService.updatePromotionHeaderWithStartDateEndDate(
          status,
          startDate,
          endDate,
          id
        );
        for (const elem of promoLine) {
          await promotionService.updateStatusPromotionLine(status, elem._id);
        }
        message = "update success ";
        res.json(message);
      }
    } catch (error) {
      next(error);
    }
  }
  async updatePromotionLine(req, res, next) {
    const { startDate, endDate, status, id } = req.body;
    var message = "status: active -- not update";

    try {
      const promoLine = await PromotionLine.findById(id);
      const promoHeader = await PromotionHeader.findById(
        promoLine.promotionHeaderId
      );

      if (promoHeader.status) {
        if (
          new Date(promoLine.endDate) >= new Date() &&
          new Date(promoLine.startDate) <= new Date()
        ) {
          if (new Date(new Date(endDate).toLocaleDateString) < new Date()) {
            message = "endDate < currendate ";
            res.json(message);
          } else if (
            new Date(new Date(endDate).toLocaleDateString) >
            new Date(promoHeader.endDate)
          ) {
            message = "endDate > endDatePromotionHeader ";
            res.json(message);
          } else if (
            new Date(new Date(startDate).toLocaleDateString) > new Date()
          ) {
            message = "update false: promotion Actice ---not update StartDate ";
            res.json(message);
          } else {
            await promotionService.updatePromotionLine(status, endDate, id);

            message = "update success with status: true";
            res.json(message);
          }
        } else {
          if (
            new Date(new Date(startDate).toLocaleDateString) < new Date() ||
            new Date(new Date(endDate).toLocaleDateString) < new Date()
          ) {
            message =
              "update false : startDate < currendate || endDate < currendate";
            res.json(message);
          }
          await promotionService.updatePromotionLineStartDateEndDate(
            startDate,
            status,
            endDate,
            id
          );

          message = "update success with status: false";
          res.json(message);
        }
      } else {
        message =
          "Can not update PromotionLine because status of PromotionsHeader is false";
        res.json(message);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();
