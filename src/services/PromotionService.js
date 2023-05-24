const Promotion = require("../modal/Promotion");
const PromotionType = require("../modal/PromotionType");
const PromotionResult = require("../modal/PromotionResult");
const PromotionHeader = require("../modal/PromotionHeader");
const PromotionLine = require("../modal/PromotionLine");
const ObjectId = require("mongoose").Types.ObjectId;

const PromotionService = {
  // save promotionDetails promotion line
  savePromotion: async (pormotion) => {
    return await pormotion.save();
  },
  // save promotion header
  savePromotionHeader: async (pormotionHeader) => {
    return await pormotionHeader.save();
  },
  // save promotion type
  savePromotionType: async (name) => {
    const promotionType = new PromotionType({ name: name });
    return await promotionType.save();
  },
  //save promotion result
  savePromotionResult: async (promotionId, ticketId, discountAmount) => {
    const promotionResult = new PromotionResult({
      promotionLineId: promotionId,
      ticketId: ticketId,
      discountAmount: discountAmount,
    });
    return await promotionResult.save();
  },
  // get all promotion
  getPromotion: async () => {
    const promotion = await Promotion.aggregate([
      {
        $lookup: {
          from: "promotionlines",
          localField: "promotionLineId",
          foreignField: "_id",
          as: "promotionlines",
        },
      },
      {
        $unwind: "$promotionlines",
      },

      {
        $lookup: {
          from: "promotionheaders",
          localField: "promotionHeaderId",
          foreignField: "_id",
          as: "promotionheaders",
        },
      },
      {
        $unwind: "$promotionheaders",
      },
      {
        $lookup: {
          from: "promotiontypes",
          localField: "promotionlines.promotionTypeId",
          foreignField: "_id",
          as: "promotiontypes",
        },
      },
      {
        $unwind: "$promotiontypes",
      },
      {
        $match: {
          "promotionlines.endDate": { $gte: new Date() },
        },
      },

      {
        $project: {
          _id: "$_id",
          percentDiscount: "$percentDiscount",
          quantityTicket: "$quantityTicket",
          purchaseAmount: "$purchaseAmount",
          moneyReduced: "$moneyReduced",
          maximumDiscount: "$maximumDiscount",
          budget: "$budget",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionType: "$promotiontypes",
          promotionLine: "$promotionlines",
          promotionLHeader: "$promotionheaders",
        },
      },
    ]);

    return promotion;
  },
  // check date promotion header
  checkDateisExistPromotionsHeader: async (startDate) => {
    const promotion = await PromotionHeader.findOne({
      endDate: { $gte: new Date(startDate) },
      startDate: { $lte: new Date(startDate) },
      status: true,
    });
    return promotion;
  },
  // check date promotion line valid promotion header
  checDatePromotionsHeader: async (startDate, endDate) => {
    const promotionDetails = await PromotionHeader.findOne({
      endDate: { $gte: new Date(startDate), $gte: new Date(endDate) },
      startDate: { $lte: new Date(endDate), $lte: new Date(startDate) },
    });
    return promotionDetails;
  },
  // check date promotion line valid promotion header
  checDatePromotionsLine: async (startDate) => {
    const promotion = await PromotionLine.findOne({
      endDate: { $gte: new Date(startDate) },
      startDate: { $lte: new Date(startDate) },
      status: true,
    });
    return promotion;
  },
  // get promotion details by promotion header id
  getPromotionDetailsByPromotionHeaderId: async (promotionHeaderId) => {
    const promotion = await Promotion.aggregate([
      {
        $match: {
          promotionHeaderId: ObjectId(promotionHeaderId),
        },
      },
      {
        $lookup: {
          from: "promotionlines",
          localField: "promotionLineId",
          foreignField: "_id",
          as: "promotionlines",
        },
      },
      {
        $unwind: "$promotionlines",
      },

      {
        $lookup: {
          from: "promotionheaders",
          localField: "promotionHeaderId",
          foreignField: "_id",
          as: "promotionheaders",
        },
      },
      {
        $unwind: "$promotionheaders",
      },
      {
        $lookup: {
          from: "promotiontypes",
          localField: "promotionlines.promotionTypeId",
          foreignField: "_id",
          as: "promotiontypes",
        },
      },
      {
        $unwind: "$promotiontypes",
      },
      {
        $lookup: {
          from: "employees",
          localField: "promotionlines.userUpdate",
          foreignField: "_id",
          as: "employeesUpdate",
        },
      },
      {
        $unwind: "$employeesUpdate",
      },
      {
        $lookup: {
          from: "employees",
          localField: "promotionlines.userCreate",
          foreignField: "_id",
          as: "employeesCreate",
        },
      },
      {
        $unwind: "$employeesCreate",
      },

      {
        $project: {
          _id: "$_id",
          percentDiscount: "$percentDiscount",
          quantityTicket: "$quantityTicket",
          purchaseAmount: "$purchaseAmount",
          moneyReduced: "$moneyReduced",
          maximumDiscount: "$maximumDiscount",
          budget: "$budget",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionType: "$promotiontypes",
          promotionLine: "$promotionlines",
          promotionLHeader: "$promotionheaders",
          user: {
            userUpDate: "$employeesUpdate",
            userCreate: "$employeesCreate",
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    return promotion;
  },
  // update promotion headers
  updatePromotionHeader: async (status, endDate, id) => {
    return await PromotionHeader.updateOne(
      { _id: id },
      {
        $set: {
          endDate: endDate,
          status: status,
        },
      }
    );
  },
  // update start date, end date promotion header
  updatePromotionHeaderWithStartDateEndDate: async (
    status,
    startDate,
    endDate,
    id
  ) => {
    return await PromotionHeader.updateOne(
      { _id: id },
      {
        $set: {
          endDate: endDate,
          startDate: startDate,
          status: status,
        },
      }
    );
  },
  // update promotion line
  updatePromotionLine: async (status, endDate, id) => {
    return await PromotionLine.updateOne(
      { _id: id },
      {
        $set: {
          endDate: endDate,
          status: status,
        },
      }
    );
  },
  // update start date, end date promotion line
  updatePromotionLineStartDateEndDate: async (
    startDate,
    status,
    endDate,
    id
  ) => {
    return await PromotionLine.updateOne(
      { _id: id },
      {
        $set: {
          endDate: endDate,
          status: status,
          startDate: startDate,
        },
      }
    );
  },
  // update status promotion line
  updateStatusPromotionLine: async (status, id) => {
    return await PromotionLine.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
      }
    );
  },
  // get total discount amount by id promotion line
  getTotalDiscountAmountByIdPromotionLine: async (
    idLine,
    startDate,
    endDate
  ) => {
    return await PromotionResult.aggregate([
      {
        $match: {
          promotionLineId: ObjectId(idLine),
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "ticketId",
          foreignField: "_id",
          as: "tickets",
        },
      },
      {
        $unwind: "$tickets",
      },
      {
        $match: {
          $and: [
            {
              "tickets.createdAt": {
                $gte: new Date(startDate),
              },
            },
            {
              "tickets.createdAt": {
                $lte: new Date(
                  new Date(endDate).getTime() + 24 * 60 * 60 * 1000
                ),
              },
            },
          ],
        },
      },
      {
        $match: {
          "tickets.status": true,
        },
      },

      {
        $group: {
          _id: "$promotionLineId",
          totalDiscountAmount: { $sum: "$discountAmount" },
          count: { $count: {} },
        },
      },
    ]);
  },

  getAllPromotionHeader: async () => {
    const promo = await PromotionHeader.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "userUpdate",
          foreignField: "_id",
          as: "employeesUpdate",
        },
      },
      {
        $unwind: "$employeesUpdate",
      },
      {
        $lookup: {
          from: "employees",
          localField: "userCreate",
          foreignField: "_id",
          as: "employeesCreate",
        },
      },
      {
        $unwind: "$employeesCreate",
      },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          startDate: "$startDate",
          endDate: "$endDate",
          status: "$status",
          code: "$code",
          imgUrl: "$imgUrl",
          description: "$description",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          user: {
            userUpDate: "$employeesUpdate",
            userCreate: "$employeesCreate",
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return promo;
  },
  getPromotionHeaderByCode: async (code) => {
    const promo = await PromotionHeader.aggregate([
      {
        $match: {
          code: code,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "userUpdate",
          foreignField: "_id",
          as: "employeesUpdate",
        },
      },
      {
        $unwind: "$employeesUpdate",
      },
      {
        $lookup: {
          from: "employees",
          localField: "userCreate",
          foreignField: "_id",
          as: "employeesCreate",
        },
      },
      {
        $unwind: "$employeesCreate",
      },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          startDate: "$startDate",
          endDate: "$endDate",
          status: "$status",
          code: "$code",
          imgUrl: "$imgUrl",
          description: "$description",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          user: {
            userUpDate: "$employeesUpdate",
            userCreate: "$employeesCreate",
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return promo;
  },
};

module.exports = PromotionService;
