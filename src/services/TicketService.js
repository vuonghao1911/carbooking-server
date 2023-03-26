const Ticket = require("../modal/Ticket");
const PromotionService = require("../services/PromotionService");
const Promotion = require("../modal/Promotion");
const Customer = require("../modal/Customer");
const Price = require("../modal/Price");
const VehicleRoute = require("../modal/VehicleRoute");
const ObjectId = require("mongoose").Types.ObjectId;
const TicketService = {
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
  getTicketById: async (_id) => {
    return await Ticket.findById(_id);
  },
  getTicketByUserId: async (userId) => {
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

  checkPriceTicket: async (createdDate, routeId) => {
    const price = await Price.findOne({
      routeId: routeId,
      endDate: { $gte: new Date(createdDate) },
      startDate: { $lte: new Date(createdDate) },
    });
    return price;
  },

  cancleTicket: async (
    idTicket,
    idPromotion,
    chair,
    vehicleRouteId,
    discountAmount
  ) => {
    if (idPromotion) {
      console.log(idPromotion);
      const { budget } = await Promotion.findById(idPromotion);
      var budgetUpdate = budget + discountAmount;
      await Promotion.updateOne(
        { _id: idPromotion },
        {
          $set: {
            budget: budgetUpdate,
          },
        }
      );
    }
    const result = await Promise.all(
      chair.map((e) => {
        const name = e.seats;
        const matchedCount = VehicleRoute.updateOne(
          { _id: ObjectId(vehicleRouteId) },
          {
            $set: { ["chair.$[elem].status"]: false },
          },
          { arrayFilters: [{ "elem.seats": name }] }
        );
        return matchedCount;
      })
    );
    await Ticket.updateOne({ _id: idTicket }, { $set: { status: false } });
  },
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
};

module.exports = TicketService;
