const Car = require("../modal/Car");
const CarType = require("../modal/CarType");
var mongoose = require("mongoose");
const Ticket = require("../modal/Ticket");
const PromotionService = require("../services/PromotionService");
const Promotion = require("../modal/Promotion");
const Customer = require("../modal/Customer");
const Price = require("../modal/Price");
const VehicleRoute = require("../modal/VehicleRoute");
const TicketRefund = require("../modal/TicketRefund");
const PromotionHeader = require("../modal/PromotionHeader");
const PromotionResult = require("../modal/PromotionResult");
const Order = require("../modal/Order");
const ObjectId = require("mongoose").Types.ObjectId;
// car and car type services

const StatisticService = {
  // get total amount of ticket refunds
  getTotalRefundAmount: async (month, year) => {
    const ticketRefund = await TicketRefund.aggregate([
      {
        $project: {
          _id: "$_id",

          status: "$status",
          chair: "$chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          returnAmount: "$returnAmount",
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              month: month,
            },
            {
              year: year,
            },
          ],
        },
      },
      {
        $group: {
          _id: "$date",
          ticketRefunds: { $push: "$$ROOT" },
          count: { $count: {} },
          returnAmount: { $sum: "$returnAmount" },
        },
      },
    ]);
    return ticketRefund;
  },
  //  get total amount all ticket
  revenueStatistics: async (month, year) => {
    const list = await Ticket.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "vehicleroutes",
          localField: "vehicleRouteId",
          foreignField: "_id",
          as: "vehicleroute",
        },
      },
      {
        $unwind: "$vehicleroute",
      },
      {
        $lookup: {
          from: "promotionresults",
          localField: "_id",
          foreignField: "ticketId",
          as: "promotionresults",
        },
      },
      {
        $lookup: {
          from: "ticketrefunds",
          localField: "_id",
          foreignField: "ticketId",
          as: "ticketrefunds",
        },
      },

      {
        $lookup: {
          from: "prices",
          localField: "priceId",
          foreignField: "_id",
          as: "prices",
        },
      },
      {
        $unwind: "$prices",
      },
      {
        $project: {
          _id: "$_id",
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          phoneNumber: "$customer.phoneNumber",
          address: "$customer.address",
          status: "$status",
          chair: "$chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionresults: "$promotionresults",
          ticketRefunds: "$ticketrefunds",
          prices: "$prices.price",
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              month: month,
            },
            {
              year: year,
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$date",
          ticket: { $push: "$$ROOT" },
        },
      },
    ]);
    return list;
  },
  // get list top route of month
  getTopRouteOfMonth: async (month, year) => {
    const list = await Ticket.aggregate([
      {
        $lookup: {
          from: "vehicleroutes",
          localField: "vehicleRouteId",
          foreignField: "_id",
          as: "vehicleroute",
        },
      },
      {
        $unwind: "$vehicleroute",
      },

      {
        $lookup: {
          from: "places",
          localField: "vehicleroute.departure",
          foreignField: "_id",
          as: "departure",
        },
      },
      {
        $unwind: "$departure",
      },
      {
        $lookup: {
          from: "places",
          localField: "vehicleroute.destination",
          foreignField: "_id",
          as: "destination",
        },
      },
      {
        $unwind: "$destination",
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          departure: "$departure._id",
          destination: "$destination._id",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              month: month,
            },
            {
              year: year,
            },
          ],
        },
      },
      {
        $group: {
          _id: { destination: "$destination", departure: "$departure" },

          count: { $count: {} },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      { $limit: 5 },
    ]);
    return list;
  },
};

module.exports = StatisticService;
