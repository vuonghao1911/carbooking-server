const Promotion = require("../modal/Promotion");
const PromotionType = require("../modal/PromotionType");
const PromotionResult = require("../modal/PromotionResult");
const PromotionHeader = require("../modal/PromotionHeader");
const PromotionLine = require("../modal/PromotionLine");
const ObjectId = require("mongoose").Types.ObjectId;

const PromotionService = {
  savePromotion: async (pormotion) => {
    return await pormotion.save();
  },
  savePromotionHeader: async (pormotionHeader) => {
    return await pormotionHeader.save();
  },
  savePromotionType: async (name) => {
    const promotionType = new PromotionType({ name: name });
    return await promotionType.save();
  },
  savePromotionResult: async (promotionId, ticketId, discountAmount) => {
    const promotionResult = new PromotionResult({
      promotionId: promotionId,
      ticketId: ticketId,
      discountAmount: discountAmount,
    });
    return await promotionResult.save();
  },
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

  checkDateisExistPromotionsHeader: async (startDate) => {
    const promotion = await PromotionHeader.findOne({
      endDate: { $gte: new Date(startDate) },
      startDate: { $lte: new Date(startDate) },
      status: true,
    });
    return promotion;
  },
  checDatePromotionsHeader: async (startDate, endDate) => {
    const promotionDetails = await PromotionHeader.findOne({
      endDate: { $gte: new Date(startDate), $gte: new Date(endDate) },
      startDate: { $lte: new Date(endDate), $lte: new Date(startDate) },
    });
    return promotionDetails;
  },
  checDatePromotionsLine: async (startDate) => {
    const promotion = await PromotionLine.findOne({
      endDate: { $gte: new Date(startDate) },
      startDate: { $lte: new Date(startDate) },
      status: true,
    });
    return promotion;
  },

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
};

module.exports = PromotionService;
