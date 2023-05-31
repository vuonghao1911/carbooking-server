var mongoose = require("mongoose");
const Ticket = require("../modal/Ticket");
const TicketRefund = require("../modal/TicketRefund");
const VehicleRoute = require("../modal/VehicleRoute");

const ObjectId = require("mongoose").Types.ObjectId;

const StatisticService = {
  // get total amount of ticket refunds
  getTotalRefundAmount: async (month, year) => {
    const ticketRefund = await TicketRefund.aggregate([
      // {
      //   $match: {
      //     isCancleLate: false,
      //   },
      // },
      {
        $project: {
          _id: "$_id",

          status: "$status",
          chair: "$chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          returnAmount: "$returnAmount",
          month: { $month: "$createdAt" },
          isCancleLate: "$isCancleLate",
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
          count: { $sum: { $size: "$chair" } },
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
        $match: {
          $or: [{ status: true }, { isCancleLate: true }],
        },
      },
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
        $match: {
          status: true,
        },
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
          quantity: "$quantity",
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

          count: { $sum: "$quantity" },
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
  // statistic ticket refund
  getInfoStatisticTicketRefund: async () => {
    const list = await TicketRefund.aggregate([
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
        $lookup: {
          from: "vehicleroutes",
          localField: "tickets.vehicleRouteId",
          foreignField: "_id",
          as: "vehicleroutes",
        },
      },
      {
        $unwind: "$vehicleroutes",
      },
      {
        $lookup: {
          from: "promotionresults",
          localField: "tickets._id",
          foreignField: "ticketId",
          as: "promotionresults",
        },
      },
      {
        $project: {
          ticketRefund: {
            updatedAt: "$updatedAt",
            returnAmount: "$returnAmount",
            dateTiketRefund: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "+07:00",
              },
            },
            codeRefund: "$code",
            countTicketRefund: { $size: "$chair" },
          },
          promotionResult: "$promotionresults",
          ticket: {
            dateTiket: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$tickets.createdAt",
                timezone: "+07:00",
              },
            },
            codeTiket: "$tickets.code",
          },

          vehicleRoute: {
            departure: "$vehicleroutes.departure",
            destination: "$vehicleroutes.destination",
          },
        },
      },
    ]);
    return list;
  },

  // statictis vehicle route by startDate and endDate
  countStatictisVehicleRoute: async (startDate, endDate) => {
    const list = await VehicleRoute.aggregate([
      {
        $match: {
          $and: [
            {
              startDate: { $gte: new Date(startDate) },
            },
            {
              startDate: { $lte: new Date(endDate) },
            },
          ],
        },
      },

      {
        $project: {
          _id: "$_id",

          departure: "$departure",
          destination: "$destination",
        },
      },

      {
        $group: {
          _id: { departure: "$departure", destination: "$destination" },
          count: { $count: {} },
        },
      },
    ]);

    return list;
  },
  // statictis ticket of vehicleRoute by startDate and endDate
  countStatictisTicketVehicleRoute: async (startDate, endDate) => {
    const list = await VehicleRoute.aggregate([
      {
        $lookup: {
          from: "tickets",
          localField: "_id",
          foreignField: "vehicleRouteId",
          as: "tickets",
        },
      },
      {
        $unwind: "$tickets",
      },
      {
        $lookup: {
          from: "prices",
          localField: "tickets.priceId",
          foreignField: "_id",
          as: "prices",
        },
      },
      {
        $unwind: "$prices",
      },
      {
        $lookup: {
          from: "promotionresults",
          localField: "tickets._id",
          foreignField: "ticketId",
          as: "promotionresults",
        },
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
      // {
      //   $match: {
      //     "tickets.status": true,
      //   },
      // },
      {
        $project: {
          _id: "$_id",
          startDate: "$startDate",
          quantity: "$tickets.quantity",
          departure: "$departure",
          destination: "$destination",
          price: "$prices.price",
          promotionResult: "$promotionresults",
          chair: "$tickets.chair",
        },
      },
      {
        $group: {
          _id: { departure: "$departure", destination: "$destination" },
          ticket: { $push: "$$ROOT" },
          countTicket: { $sum: "$quantity" },
        },
      },
    ]);

    return list;
  },

  // statictis ticket refunds of vehicleRoute by departure_id and destination_id
  countStatictisTicketRefundsVehicleRoute: async (
    startDate,
    endDate,
    depId,
    desId
  ) => {
    const list = await TicketRefund.aggregate([
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
        $lookup: {
          from: "vehicleroutes",
          localField: "tickets.vehicleRouteId",
          foreignField: "_id",
          as: "vehicleroutes",
        },
      },

      {
        $unwind: "$vehicleroutes",
      },

      {
        $match: {
          "vehicleroutes.departure": ObjectId(depId),
          "vehicleroutes.destination": ObjectId(desId),
        },
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
        $project: {
          _id: "$_id",

          chair: "$chair",
          departure: "$vehicleroutes.departure",
          destination: "$vehicleroutes.destination",
          returnAmount: "$returnAmount",
        },
      },
      {
        $group: {
          _id: { departure: "$departure", destination: "$destination" },

          countTicket: { $sum: { $size: "$chair" } },
          totalAmountRefund: { $sum: "$returnAmount" },
        },
      },
    ]);
    return list;
  },
  // count ticket refund of type char by date
  countTicketRefundTypeChairByDate: async (startDate, endDate) => {
    const list = await VehicleRoute.aggregate([
      {
        $match: {
          $and: [
            {
              startDate: { $gte: new Date(startDate) },
            },
            {
              startDate: { $lte: new Date(endDate) },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "_id",
          foreignField: "vehicleRouteId",
          as: "tickets",
        },
      },
      {
        $unwind: "$tickets",
      },
      {
        $lookup: {
          from: "cars",
          localField: "carId",
          foreignField: "_id",
          as: "cars",
        },
      },

      {
        $unwind: "$cars",
      },
      {
        $lookup: {
          from: "cartypes",
          localField: "cars.typeCarId",
          foreignField: "_id",
          as: "cartypes",
        },
      },
      {
        $unwind: "$cartypes",
      },
      {
        $lookup: {
          from: "ticketrefunds",
          localField: "tickets._id",
          foreignField: "ticketId",
          as: "ticketrefunds",
        },
      },
      {
        $unwind: "$ticketrefunds",
      },

      {
        $project: {
          _id: "$_id",

          chairTicketReufund: "$ticketrefunds.chair",
          carTypeId: "$cartypes._id",
        },
      },
      {
        $group: {
          _id: "$carTypeId",
          countTicketRefund: { $sum: { $size: "$chairTicketReufund" } },
        },
      },
    ]);

    return list;
  },
  // count ticket type car
  countTicketTypeChairByDate: async (startDate, endDate, carTypeId) => {
    const list = await VehicleRoute.aggregate([
      {
        $match: {
          $and: [
            {
              startDate: { $gte: new Date(startDate) },
            },
            {
              startDate: { $lte: new Date(endDate) },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "tickets",
          localField: "_id",
          foreignField: "vehicleRouteId",
          as: "tickets",
        },
      },
      {
        $unwind: "$tickets",
      },
      {
        $lookup: {
          from: "cars",
          localField: "carId",
          foreignField: "_id",
          as: "cars",
        },
      },

      {
        $unwind: "$cars",
      },
      {
        $lookup: {
          from: "cartypes",
          localField: "cars.typeCarId",
          foreignField: "_id",
          as: "cartypes",
        },
      },
      {
        $unwind: "$cartypes",
      },
      {
        $match: {
          "tickets.status": true,
        },
      },
      {
        $match: {
          "cartypes._id": ObjectId(carTypeId),
        },
      },
      {
        $project: {
          _id: "$_id",
          quantityTicket: "$tickets.quantity",
          carTypeId: "$cartypes._id",
          carType: "$cartypes.type",
        },
      },
      {
        $group: {
          _id: "$carTypeId",
          countTicket: { $sum: "$quantityTicket" },
        },
      },
    ]);

    return list;
  },
  // count ticket current date
  countTicketByCurrenDate: async (startDate) => {
    const list = await Ticket.aggregate([
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
        $match: {
          $or: [{ status: true }, { isCancleLate: true }],
        },
      },
      {
        $project: {
          _id: "$_id",
          quantityTicket: "$quantity",
          chair: "$chair",
          promotionResults: "$promotionresults",
          prices: "$prices.price",
          date: {
            $dateToString: {
              format: "%Y/%m/%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
          isCancleLate: "$isCancleLate",
        },
      },
      {
        $match: {
          date: startDate,
        },
      },
      {
        $group: {
          _id: "$date",
          ticket: { $push: "$$ROOT" },
          countTicket: { $sum: "$quantityTicket" },
        },
      },
    ]);

    return list;
  },
  // count ticket refund current date
  countTicketRefundByCurrenDate: async (startDate) => {
    const list = await TicketRefund.aggregate([
      {
        $project: {
          _id: "$_id",
          chair: "$chair",
          date: {
            $dateToString: {
              format: "%Y/%m/%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $match: {
          date: startDate,
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: { $size: "$chair" } },
        },
      },
    ]);

    return list;
  },

  // statictis customer by current date
  countCustomerCurrenDate: async (startDate) => {
    const list = await Ticket.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customers",
        },
      },
      {
        $unwind: "$customers",
      },
      {
        $project: {
          _id: "$_id",
          chair: "$chair",
          customerId: "$customers._id",
          date: {
            $dateToString: {
              format: "%Y/%m/%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $match: {
          date: startDate,
        },
      },
      {
        $group: {
          _id: "$customerId",
          count: { $count: {} },
        },
      },
    ]);

    return list;
  },
};

module.exports = StatisticService;
