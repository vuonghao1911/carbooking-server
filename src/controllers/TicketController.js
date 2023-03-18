const ticketService = require("../services/TicketService");
const ObjectId = require("mongoose").Types.ObjectId;
var mongoose = require("mongoose");
const Ticket = require("../modal/Ticket");
const Customer = require("../modal/Customer");
const VehicleRoute = require("../modal/VehicleRoute");

const moment = require("moment");

const Route = require("../modal/Route");
const PromotionResults = require("../modal/PromotionResult");
const PromotionLine = require("../modal/PromotionLine");

class TicketController {
  async bookingTicket(req, res, next) {
    const {
      vehicleRouteId,
      customer,
      quantity,
      chair,
      locationBus,
      phoneNumber,
      discountAmount,
      idPromotion,
      priceId,
    } = req.body;
    console.log(chair);
    console.log(customer);
    const codeFind = await Ticket.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }

    try {
      const Arrayplace = await Promise.all(
        chair.map((e) => {
          const name = e.seats;
          const matchedCount = VehicleRoute.updateOne(
            { _id: ObjectId(vehicleRouteId) },
            {
              $set: { ["chair.$[elem].status"]: true },
            },
            { arrayFilters: [{ "elem.seats": name }] }
          );
          return matchedCount;
        })
      );
      const checkCustomer = await Customer.count({ phoneNumber: phoneNumber });
      if (checkCustomer === 0) {
        const customerAdd = new Customer({
          firstName: customer.firstNameCustomer,
          lastName: customer.lastNameCustomer,
          phoneNumber: phoneNumber,
        });
        const newCustomer = await customerAdd.save();

        const saveticket = await ticketService.saveTicket(
          idPromotion,
          vehicleRouteId,
          newCustomer._id,
          quantity,
          chair,
          locationBus,
          phoneNumber,
          discountAmount,
          code,
          priceId
        );
        return res.json(saveticket);
      } else {
        const customerFind = await Customer.findOne({
          phoneNumber: phoneNumber,
        });

        const saveticket = await ticketService.saveTicket(
          idPromotion,
          vehicleRouteId,
          customerFind._id,
          quantity,
          chair,
          locationBus,
          phoneNumber,
          discountAmount,
          code,
          priceId
        );

        return res.json(saveticket);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCustomerById(req, res, next) {
    const { userId } = req.params;
    console.log(userId);

    try {
      const customer = await Customer.findById(userId);

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  async getTicket(req, res, next) {
    try {
      const tickets = await Ticket.aggregate([
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
            from: "promotions",
            localField: "promotionresults.promotionId",
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
            promotions: "$promotions",
            price: "$prices.price",
          },
        },
      ]);
      var listTicketResult = [];
      for (const ticket of tickets) {
        // get routeId
        const { _id, intendTime } = await Route.findOne({
          "departure._id": ObjectId(ticket.departure._id),
          "destination._id": ObjectId(ticket.destination._id),
        });
        var pomrotionLine;
        if (ticket.promotions[0]) {
          pomrotionLine = await PromotionLine.findById(
            ticket.promotions[0].promotionLineId
          );
        }
        listTicketResult.push({
          ...ticket,
          pomrotionLine,
          intendTime: intendTime,
        });
      }
      res.json(listTicketResult);
    } catch (error) {
      next(error);
    }
  }

  async getAllTicketByUserId(req, res, next) {
    const { userId } = req.params;
    console.log(userId);

    try {
      const listTicket = await ticketService.getTicketByUserId(userId);
      var listTicketResult = [];
      for (const ticket of listTicket) {
        // get routeId
        const { _id, intendTime } = await Route.findOne({
          "departure._id": ObjectId(ticket.departure._id),
          "destination._id": ObjectId(ticket.destination._id),
        });
        var pomrotionLine;
        if (ticket.promotions[0]) {
          pomrotionLine = await PromotionLine.findById(
            ticket.promotions[0].promotionLineId
          );
        }
        listTicketResult.push({
          ...ticket,
          pomrotionLine,
          intendTime: intendTime,
        });
      }
      res.json(listTicketResult);
    } catch (error) {
      next(error);
    }
  }

  async CanceledTicket(req, res, next) {
    const { ticketId } = req.params;

    try {
      // get idPromotion
      const promotionresults = await PromotionResults.findOne({
        ticketId: ticketId,
      });

      const { chair, vehicleRouteId } = await Ticket.findById(ticketId);

      if (vehicleRouteId) {
        if (promotionresults) {
          await ticketService.cancleTicket(
            ticketId,
            promotionresults.promotionId,
            chair,
            vehicleRouteId,
            promotionresults.discountAmount
          );
        } else {
          await ticketService.cancleTicket(
            ticketId,
            null,
            chair,
            vehicleRouteId,
            null
          );
        }

        res.json({ cancleTicket: true });
      } else {
        res.json({ cancleTicket: false });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();
