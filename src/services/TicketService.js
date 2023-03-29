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
const TicketService = {
  // save ticket
  saveTicket: async (
    vehicleRouteId,
    customerId,
    quantity,
    chair,
    locationBus,
    phoneNumber,
    promotion,
    code,
    priceId
  ) => {
    var ticketSave;
    console.log(phoneNumber);
    await Customer.updateOne(
      { _id: customerId },
      {
        $set: {
          customerTypeId: new ObjectId("640e987e186ba7d1aee14309"),
        },
      }
    );
    if (promotion.length > 0) {
      const ticket = new Ticket({
        vehicleRouteId: vehicleRouteId,
        customerId: customerId,
        quantity: quantity,
        chair: chair,
        locationBus: locationBus,
        phoneNumber: phoneNumber,
        code: code + 1,
        priceId: priceId,
      });

      ticketSave = await ticket.save();
      for (const elem of promotion) {
        await PromotionService.savePromotionResult(
          elem.idPromotion,
          ticketSave._id,
          elem.discountAmount
        );
        const { remainingBudget, _id } = await Promotion.findOne({
          promotionLineId: elem.idPromotion,
        });
        var budgetUpdate = remainingBudget - elem.discountAmount;
        await Promotion.updateOne(
          { _id: _id },
          {
            $set: {
              remainingBudget: budgetUpdate,
            },
          }
        );
      }
    } else {
      const ticket = new Ticket({
        vehicleRouteId: vehicleRouteId,
        customerId: customerId,
        quantity: quantity,
        chair: chair,
        locationBus: locationBus,
        phoneNumber: phoneNumber,
        code: code + 1,
        priceId: priceId,
      });
      ticketSave = await ticket.save();
    }

    return ticketSave;
  },
  // get ticket by id ticket
  getTicketById: async (_id) => {
    return await Ticket.findById(_id);
  },
  // get ticket by user id
  getTicketByUserId: async (userId) => {
    const ticket = await Ticket.aggregate([
      {
        $match: {
          customerId: ObjectId(userId),
          status: true,
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
          from: "departuretimes",
          localField: "vehicleroute.startTime",
          foreignField: "_id",
          as: "departuretimes",
        },
      },
      {
        $unwind: "$departuretimes",
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
          from: "promotionlines",
          localField: "promotionresults.promotionLineId",
          foreignField: "_id",
          as: "promotions",
        },
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
        $lookup: {
          from: "cars",
          localField: "vehicleroute.carId",
          foreignField: "_id",
          as: "car",
        },
      },
      {
        $unwind: "$car",
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
          departure: {
            _id: 1,
            name: 1,
          },
          destination: {
            _id: 1,
            name: 1,
          },
          licensePlates: "$car.licensePlates",
          startDate: "$vehicleroute.startDate",
          endTime: "$vehicleroute.endTime",
          startTime: "$departuretimes.time",
          status: "$status",
          locaDeparture: "$locationBus",
          chair: "$chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionresults: "$promotionresults",
          price: "$prices.price",
        },
      },
      { $sort: { startDate: -1 } },
    ]);

    return ticket;
  },
  // get ticket by user id for Admin page
  getTicketByUserIdForAdmin: async (userId) => {
    const ticket = await Ticket.aggregate([
      {
        $match: {
          customerId: ObjectId(userId),
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
          from: "departuretimes",
          localField: "vehicleroute.startTime",
          foreignField: "_id",
          as: "departuretimes",
        },
      },
      {
        $unwind: "$departuretimes",
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
          from: "promotionlines",
          localField: "promotionresults.promotionLineId",
          foreignField: "_id",
          as: "promotions",
        },
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
        $lookup: {
          from: "cars",
          localField: "vehicleroute.carId",
          foreignField: "_id",
          as: "car",
        },
      },
      {
        $unwind: "$car",
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
          departure: {
            _id: 1,
            name: 1,
          },
          destination: {
            _id: 1,
            name: 1,
          },
          licensePlates: "$car.licensePlates",
          startDate: "$vehicleroute.startDate",
          endTime: "$vehicleroute.endTime",
          startTime: "$departuretimes.time",
          status: "$status",
          locaDeparture: "$locationBus",
          chair: "$chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionresults: "$promotionresults",
          price: "$prices.price",
        },
      },
      { $sort: { startDate: -1 } },
    ]);

    return ticket;
  },
  // check price ticket
  checkPriceTicket: async (createdDate, routeId) => {
    const price = await Price.findOne({
      routeId: routeId,
      endDate: { $gte: new Date(createdDate) },
      startDate: { $lte: new Date(createdDate) },
    });
    return price;
  },
  // cancle ticket
  cancleTicket: async (idTicket, returnAmount, note) => {
    const ticket = await Ticket.findById(idTicket);
    const promotion = await PromotionResult.find({ ticketId: idTicket });
    const codeFind = await TicketRefund.find().sort({ _id: -1 }).limit(1);
    var code;

    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    if (promotion.length > 0) {
      for (const elem of promotion) {
        const { remainingBudget, _id } = await Promotion.findOne({
          promotionLineId: elem.promotionLineId,
        });
        var newRemainingBuget = remainingBudget + elem.discountAmount;
        console.log("old", remainingBudget);
        console.log("new", newRemainingBuget);
        await Promotion.updateOne(
          { _id: ObjectId(_id) },
          {
            $set: { remainingBudget: newRemainingBuget },
          }
        );
      }
    }

    const result = await Promise.all(
      ticket.chair.map((e) => {
        const name = e.seats;
        const matchedCount = VehicleRoute.updateOne(
          { _id: ObjectId(ticket.vehicleRouteId) },
          {
            $set: { ["chair.$[elem].status"]: false },
          },
          { arrayFilters: [{ "elem.seats": name }] }
        );
        return matchedCount;
      })
    );
    await Ticket.updateOne({ _id: idTicket }, { $set: { status: false } });

    const ticketRefund = new TicketRefund({
      ticketId: idTicket,
      chair: ticket.chair,
      code: code + 1,
      note: note,
      returnAmount: returnAmount,
    });
    return await ticketRefund.save();
  },
  // create ticket refund Ticket by seat
  refundChairTicket: async (
    idTicket,
    chair,
    returnAmount,
    note,
    promotionLine
  ) => {
    const arrayPormoResult = [];
    const ticket = await Ticket.findById(idTicket);

    for (const promoLine of promotionLine) {
      const promotion = await PromotionResult.findOne({
        ticketId: idTicket,
        promotionLineId: promoLine.id,
      });
      if (promotion) {
        arrayPormoResult.push(promotion);
      }
    }
    const codeFind = await TicketRefund.find().sort({ _id: -1 }).limit(1);
    var code;

    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    if (arrayPormoResult.length > 0) {
      for (const elem of arrayPormoResult) {
        const { remainingBudget, _id } = await Promotion.findOne({
          promotionLineId: elem.promotionLineId,
        });
        var newRemainingBuget = remainingBudget + elem.discountAmount;
        console.log("old", remainingBudget);
        console.log("new", newRemainingBuget);
        await Promotion.updateOne(
          { _id: ObjectId(_id) },
          {
            $set: { remainingBudget: newRemainingBuget },
          }
        );
      }
    }

    const result = await Promise.all(
      chair.map((e) => {
        const name = e.seats;
        const matchedCount = VehicleRoute.updateOne(
          { _id: ObjectId(ticket.vehicleRouteId) },
          {
            $set: { ["chair.$[elem].status"]: false },
          },
          { arrayFilters: [{ "elem.seats": name }] }
        );
        return matchedCount;
      })
    );
    await Ticket.updateOne({ _id: idTicket }, { $set: { status: false } });

    const ticketRefund = new TicketRefund({
      ticketId: idTicket,
      chair: chair,
      code: code + 1,
      note: note,
      returnAmount: returnAmount,
    });
    return await ticketRefund.save();
  },
  // get all ticket by route Id
  getTicketByVehicleRouteId: async (vehicleRoute) => {
    const ticket = await Ticket.aggregate([
      {
        $match: {
          vehicleRouteId: ObjectId(vehicleRoute),
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
        $lookup: {
          from: "promotionresults",
          localField: "_id",
          foreignField: "ticketId",
          as: "promotionresults",
        },
      },
      {
        $project: {
          _id: "$_id",
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          phoneNumber: "$customer.phoneNumber",
          address: "$customer.address",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          code: "$code",
          status: "$status",
          chair: "$chair",
          quantity: "$quantity",
          price: "$prices.price",
          promotionresults: "$promotionresults",
        },
      },
      { $sort: { _id: -1 } },
    ]);
    return ticket;
  },
  // get ticket refund by user id
  getTicketRefundByUserId: async (userId) => {
    const ticket = await TicketRefund.aggregate([
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
          from: "customers",
          localField: "tickets.customerId",
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
          localField: "tickets.vehicleRouteId",
          foreignField: "_id",
          as: "vehicleroute",
        },
      },
      {
        $unwind: "$vehicleroute",
      },
      {
        $lookup: {
          from: "departuretimes",
          localField: "vehicleroute.startTime",
          foreignField: "_id",
          as: "departuretimes",
        },
      },
      {
        $unwind: "$departuretimes",
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
        $lookup: {
          from: "cars",
          localField: "vehicleroute.carId",
          foreignField: "_id",
          as: "car",
        },
      },
      {
        $unwind: "$car",
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
        $match: {
          "customer._id": ObjectId(userId),
        },
      },
      {
        $project: {
          _id: "$_id",
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          phoneNumber: "$customer.phoneNumber",
          address: "$customer.address",
          departure: {
            _id: 1,
            name: 1,
          },
          destination: {
            _id: 1,
            name: 1,
          },
          licensePlates: "$car.licensePlates",
          startDate: "$vehicleroute.startDate",
          endTime: "$vehicleroute.endTime",
          startTime: "$departuretimes.time",
          note: "$note",
          returnAmount: "$returnAmount",
          status: "$status",
          chairRefund: "$chair",
          chairTicket: "$tickets.chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionresults: "$promotionresults",
          price: "$prices.price",
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return ticket;
  },
  // get all ticket refund
  getAllTicketRefund: async () => {
    const ticket = await TicketRefund.aggregate([
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
          from: "customers",
          localField: "tickets.customerId",
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
          localField: "tickets.vehicleRouteId",
          foreignField: "_id",
          as: "vehicleroute",
        },
      },
      {
        $unwind: "$vehicleroute",
      },
      {
        $lookup: {
          from: "departuretimes",
          localField: "vehicleroute.startTime",
          foreignField: "_id",
          as: "departuretimes",
        },
      },
      {
        $unwind: "$departuretimes",
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
        $lookup: {
          from: "cars",
          localField: "vehicleroute.carId",
          foreignField: "_id",
          as: "car",
        },
      },
      {
        $unwind: "$car",
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
        $project: {
          _id: "$_id",
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          phoneNumber: "$customer.phoneNumber",
          address: "$customer.address",
          departure: {
            _id: 1,
            name: 1,
          },
          destination: {
            _id: 1,
            name: 1,
          },
          licensePlates: "$car.licensePlates",
          startDate: "$vehicleroute.startDate",
          endTime: "$vehicleroute.endTime",
          startTime: "$departuretimes.time",
          note: "$note",
          returnAmount: "$returnAmount",
          status: "$status",
          chairRefund: "$chair",
          chairTicket: "$tickets.chair",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          promotionresults: "$promotionresults",
          price: "$prices.price",
        },
      },
      { $sort: { startDate: -1 } },
    ]);

    return ticket;
  },
  // update status order and update status chair
  updateStatusOrder: async (idOrder, status) => {
    const order = await Order.findById(idOrder);

    if (status) {
      await Order.updateOne({ _id: idOrder }, { $set: { status: status } });
    } else {
      const result = await Promise.all(
        order.chair.map((e) => {
          const name = e.seats;
          const matchedCount = VehicleRoute.updateOne(
            { _id: ObjectId(order.vehicleRouteId) },
            {
              $set: { ["chair.$[elem].status"]: false },
            },
            { arrayFilters: [{ "elem.seats": name }] }
          );
          return matchedCount;
        })
      );
      await Order.updateOne({ _id: idOrder }, { $set: { status: status } });
    }

    return status;
  },
};

module.exports = TicketService;
