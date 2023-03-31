const ticketService = require("../services/TicketService");
const ObjectId = require("mongoose").Types.ObjectId;
const utilsService = require("../utils/utils");
const Ticket = require("../modal/Ticket");
const Customer = require("../modal/Customer");
const VehicleRoute = require("../modal/VehicleRoute");
const Order = require("../modal/Order");

const moment = require("moment");

const Route = require("../modal/Route");
const PromotionResults = require("../modal/PromotionResult");
const PromotionLine = require("../modal/PromotionLine");
const TicketService = require("../services/TicketService");

class TicketController {
  // body save tickets
  // {
  //  "vehicleRouteId":"640f28b6275c2402f5295703",
  //  "customer":{
  //            "firstNameCustomer":"Hao",
  //            "lastNameCustomer":"Vuong"
  //             },
  //   "quantity":2,
  //    "chair":
  //          [
  //            {
  //           "seats":"A-08"
  //              },
  //            {
  //           "seats":"B-16"
  //              }
  //            ],
  //      "locationBus":{
  //       "address": {
  //                    "name": "Bến xe Miền Tây",
  //                    "detailAddress": "số 395 Kinh Dương Vương",
  //                    "ward": "Phường An Lạc",
  //                    "district": "Quận Tân Bình",
  //                    "province": "Thành phố Hồ Chí Minh",
  //                    }
  //                      },
  //       "phoneNumber":"0373794680",
  //       "promotion":[
  //             {
  //                 "idPromotion":"640e090fa1fb05eebee22aa7", // Id Promotion Line
  //                 "discountAmount":15000
  //             },
  //             {
  //                 "idPromotion":"640f19f71616703a11d29a03", // Id Promotion Line
  //                  "discountAmount":25000
  //             }
  //                  ],
  //        "priceId":"640de7ee0bc741d653d7bc53"
  //         "employeeId":""
  //  }

  async bookingTicket(req, res, next) {
    const {
      vehicleRouteId,
      customer,
      quantity,
      chair,
      locationBus,
      phoneNumber,
      promotion,
      priceId,
      employeeId,
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
          vehicleRouteId,
          newCustomer._id,
          quantity,
          chair,
          locationBus,
          phoneNumber,
          promotion,
          code,
          priceId,
          employeeId
        );
        return res.json(saveticket);
      } else {
        const customerFind = await Customer.findOne({
          phoneNumber: phoneNumber,
        });

        const saveticket = await ticketService.saveTicket(
          vehicleRouteId,
          customerFind._id,
          quantity,
          chair,
          locationBus,
          phoneNumber,
          promotion,
          code,
          priceId,
          employeeId
        );

        return res.json(saveticket);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  // get customer by id
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
  // get all ticket with query parameters
  async getTicket(req, res, next) {
    const { page = "", size = "", name = "" } = req.query;
    try {
      var tickets = [];
      if (name != "") {
        const customer = await Customer.find({ $text: { $search: name } });
        for (const elem of customer) {
          const customerFind = await TicketService.getTicketByUserIdForAdmin(
            elem._id
          );
          if (customerFind.length > 0) {
            tickets.push(...customerFind);
          }
        }
      } else {
        tickets = await Ticket.aggregate([
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
      }

      var listTicketResult = [];
      for (const ticket of tickets) {
        // get routeId
        const { _id, intendTime } = await Route.findOne({
          "departure._id": ObjectId(ticket.departure._id),
          "destination._id": ObjectId(ticket.destination._id),
        });
        var pomrotionLine;
        const listPromotions = [];
        if (ticket.promotionresults.length > 0) {
          for (const elem of ticket.promotionresults) {
            pomrotionLine = await PromotionLine.findById(elem.promotionLineId);
            listPromotions.push({
              PromotionResults: elem,
              PromotionLine: pomrotionLine,
            });
          }
          listTicketResult.push({
            ...ticket,
            listPromotions,
            intendTime: intendTime,
          });
        } else {
          listTicketResult.push({
            ...ticket,
            listPromotions: null,
            intendTime: intendTime,
          });
        }
      }
      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          listTicketResult
        );
        res.json({ listTicketResult: arrPagination, totalPages });
      } else {
        res.json({ listTicketResult: listTicketResult, totalPages: null });
      }
    } catch (error) {
      next(error);
    }
  }
  // get all ticket by user Id
  async getAllTicketByUserId(req, res, next) {
    const { userId } = req.params;
    console.log(userId);
    var listTicketResult = [];
    try {
      const listTicket = await ticketService.getTicketByUserId(userId);

      for (const ticket of listTicket) {
        // get routeId
        const { _id, intendTime } = await Route.findOne({
          "departure._id": ObjectId(ticket.departure._id),
          "destination._id": ObjectId(ticket.destination._id),
        });
        var pomrotionLine;
        const listPromotions = [];
        if (ticket.promotionresults.length > 0) {
          for (const elem of ticket.promotionresults) {
            pomrotionLine = await PromotionLine.findById(elem.promotionLineId);
            listPromotions.push({
              PromotionResults: elem,
              PromotionLine: pomrotionLine,
            });
          }

          listTicketResult.push({
            ...ticket,
            listPromotions,
            intendTime: intendTime,
          });
        } else {
          listTicketResult.push({
            ...ticket,
            listPromotions: null,
            intendTime: intendTime,
          });
        }
      }
      res.json(listTicketResult);
    } catch (error) {
      next(error);
    }
  }
  // cancle ticket and create new Refund ticket
  async CanceledTicket(req, res, next) {
    const { ticketId, note, returnAmount } = req.body;

    try {
      const cancleTicket = await ticketService.cancleTicket(
        ticketId,
        returnAmount,
        note
      );

      res.json({ cancleTicket, message: " cancle success" });
    } catch (error) {
      next(error);
    }
  }
  //create ticket refund Ticket by seat
  async refundChairOfTicket(req, res, next) {
    const { idTicket, chair, returnAmount, note, promotionLine } = req.body;

    try {
      const cancleTicket = await ticketService.refundChairTicket(
        idTicket,
        chair,
        returnAmount,
        note,
        promotionLine
      );

      res.json({ cancleTicket, message: " refund ticket success" });
    } catch (error) {
      next(error);
    }
  }
  // get all ticket refund by user id
  async getAllTicketRefundByUserId(req, res, next) {
    const { userId } = req.params;
    console.log(userId);
    try {
      const listTicket = await ticketService.getTicketRefundByUserId(userId);

      res.json(listTicket);
    } catch (error) {
      next(error);
    }
  }
  // get all ticket refund  with query parameters
  async getAllTicketRefund(req, res, next) {
    const { page = "", size = "", name = "" } = req.query;
    try {
      var tickets = [];
      if (name != "") {
        const customer = await Customer.find({ $text: { $search: name } });
        for (const elem of customer) {
          const customerFind = await TicketService.getTicketRefundByUserId(
            elem._id
          );
          if (customerFind.length > 0) {
            tickets.push(...customerFind);
          }
        }
      } else {
        tickets = await TicketService.getAllTicketRefund();
      }

      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          tickets
        );
        res.json({ listTicketResult: arrPagination, totalPages });
      } else {
        res.json({ listTicketResult: tickets, totalPages: null });
      }
    } catch (error) {
      next(error);
    }
  }

  // create order
  async createOrderTicket(req, res, next) {
    const { customerId = null, chair, vehicleRouteId } = req.body;

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
      const order = await new Order({
        customerId: customerId,
        chair: chair,
        vehicleRouteId: vehicleRouteId,
      }).save();

      res.json(order);
    } catch (error) {
      next(error);
    }
  }
  // update status order when payment fails
  async updateStatusOrderTicket(req, res, next) {
    const { idOrder, status } = req.body;

    try {
      const statusResult = await ticketService.updateStatusOrder(
        idOrder,
        status
      );
      if (statusResult) {
        res.json({ message: "order payment successfully" });
      } else {
        res.json({ message: "order payment failed, update status success" });
      }
    } catch (error) {
      next(error);
    }
  }
  // statistic ticket by customer
  async statisticTicketByAllCustomer(req, res, next) {
    const { startDate, endDate, page, size } = req.query;
    const arrayFinal = [];
    try {
      const listTicket = await ticketService.statisticTicketByCustomer();

      for (const ticket of listTicket) {
        var totalDiscount = 0;
        if (ticket.promotionresults.length > 0) {
          for (const promotionResult of ticket.promotionresults) {
            totalDiscount += promotionResult.discountAmount;
          }
        }
        const total = ticket.prices * ticket.chair.length;
        const totalAfterDiscount = total - totalDiscount;

        arrayFinal.push({
          customer: ticket.customer,
          totalDiscount: totalDiscount,
          totalAfterDiscount: totalAfterDiscount,
          total: total,
          route: {
            departure: ticket.departure,
            destination: ticket.destination,
          },
        });
      }
      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayFinal
        );
        res.json({ data: arrPagination, messages: "success", totalPages });
      }
    } catch (error) {
      next(error);
    }
  }

  async statisticTicketByAllEmployee(req, res, next) {
    const { startDate, endDate, page, size } = req.query;
    const arrayFinal = [];
    try {
      const listTicket = await ticketService.statisticTicketByEmployee();

      for (const ticket of listTicket) {
        var totalDiscount = 0;
        if (ticket.promotionresults.length > 0) {
          for (const promotionResult of ticket.promotionresults) {
            totalDiscount += promotionResult.discountAmount;
          }
        }
        const total = ticket.prices * ticket.chair.length;
        const totalAfterDiscount = total - totalDiscount;

        arrayFinal.push({
          customer: ticket.customer,
          totalDiscount: totalDiscount,
          totalAfterDiscount: totalAfterDiscount,
          total: total,
          route: {
            departure: ticket.departure,
            destination: ticket.destination,
          },
        });
      }
      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayFinal
        );
        res.json({ data: arrPagination, messages: "success", totalPages });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();
