const ticketService = require("../services/TicketService");
const ObjectId = require("mongoose").Types.ObjectId;
const utilsService = require("../utils/utils");
const Ticket = require("../modal/Ticket");
const Customer = require("../modal/Customer");
const Employee = require("../modal/Employee");
const VehicleRoute = require("../modal/VehicleRoute");
const Order = require("../modal/Order");
const Route = require("../modal/Route");
const PromotionResults = require("../modal/PromotionResult");
const PromotionLine = require("../modal/PromotionLine");
const TicketService = require("../services/TicketService");
const statisticServie = require("../services/StatisticService");
const moment = require("moment");
const TicketRefund = require("../modal/TicketRefund");

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

    var code = new Date().getTime();

    const codeFind = await Customer.find().sort({ _id: -1 }).limit(1);
    var code2;
    if (codeFind[0]) {
      code2 = codeFind[0].code;
    } else {
      code2 = "KH00";
    }
    var code1 = "";
    var codeString = code2.substring(2);

    var codeEmpl = Number(codeString) + Number(1);

    if (Number(codeString) < 9) {
      code1 = `KH0${codeEmpl}`;
    } else {
      code1 = `KH${codeEmpl}`;
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
          customerTypeId: ObjectId("640e9859186ba7d1aee14307"),
          code: code1,
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

    try {
      const customer = await Customer.findById(userId);

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  // get all ticket with query parameters
  async getTicket(req, res, next) {
    const { page = "", size = "", name = "", phone = "" } = req.query;
    const { depId = "", desId = "", date = "", dateCreate = "" } = req.query;
    try {
      var tickets = [];
      if (name != "" && phone == "") {
        const customer = await Customer.find({ $text: { $search: name } });
        for (const elem of customer) {
          const customerFind = await TicketService.getTicketByUserIdForAdmin(
            elem._id
          );
          if (customerFind?.length > 0) {
            tickets.push(...customerFind);
          }
        }
      } else if (name == "" && phone != "") {
        const customer = await Customer.find({ phoneNumber: phone });
        for (const elem of customer) {
          const customerFind = await TicketService.getTicketByUserIdForAdmin(
            elem._id
          );
          if (customerFind?.length > 0) {
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
              from: "employees",
              localField: "employeeId",
              foreignField: "_id",
              as: "employees",
            },
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
              idCustomer: "$customer._id",
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
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "+07:00",
                },
              },
              employee: "$employees",
              updatedAt: "$updatedAt",
              promotionresults: "$promotionresults",
              price: "$prices.price",
            },
          },
          { $sort: { createdAt: -1 } },
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
        if (ticket.promotionresults?.length > 0) {
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
      if (dateCreate != "") {
        const tickets = [];
        listTicketResult.forEach((element) => {
          if (
            new Date(element.date).toLocaleDateString() ===
            new Date(dateCreate).toLocaleDateString()
          ) {
            tickets.push(element);
          }
        });
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          tickets
        );

        return res.json({ listTicketResult: arrPagination, totalPages });
      }

      if (desId !== "" && depId !== "") {
        const tickets = [];
        if (date !== "") {
          listTicketResult.forEach((element) => {
            if (
              element.destination._id.toString() == desId &&
              element.departure._id.toString() == depId &&
              new Date(element.startDate).toLocaleDateString() ===
                new Date(date).toLocaleDateString()
            ) {
              tickets.push(element);
            }
          });
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            tickets
          );

          return res.json({ listTicketResult: arrPagination, totalPages });
        } else {
          listTicketResult.forEach((element) => {
            if (
              element.destination._id.toString() == desId &&
              element.departure._id.toString() == depId
            ) {
              tickets.push(element);
            }
          });
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            tickets
          );

          return res.json({ listTicketResult: arrPagination, totalPages });
        }
      } else if (date !== "") {
        const tickets = [];
        listTicketResult.forEach((element) => {
          if (
            new Date(element.startDate).toLocaleDateString() ===
            new Date(date).toLocaleDateString()
          ) {
            tickets.push(element);
          }
        });
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          tickets
        );

        return res.json({ listTicketResult: arrPagination, totalPages });
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
    const { page, size } = req.query;

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
        if (ticket.promotionresults?.length > 0) {
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
      if (page && size) {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          listTicketResult
        );
        return res.json({ data: arrPagination, totalPages });
      } else {
        return res.json({ data: listTicketResult, totalPages: null });
      }
    } catch (error) {
      next(error);
    }
  }
  // get ticket by id
  async getTicketByCode(req, res, next) {
    const code = +req.query.code;

    var listTicketResult = [];
    try {
      const listTicket = await ticketService.getTicketByCode(code);

      for (const ticket of listTicket) {
        // get routeId
        const { _id, intendTime } = await Route.findOne({
          "departure._id": ObjectId(ticket.departure._id),
          "destination._id": ObjectId(ticket.destination._id),
        });
        var pomrotionLine;
        const listPromotions = [];
        if (ticket.promotionresults?.length > 0) {
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

      return res.json({ data: listTicketResult, totalPages: null });
    } catch (error) {
      next(error);
    }
  }
  // cancle ticket and create new Refund ticket
  async CanceledTicket(req, res, next) {
    const {
      ticketId,
      note,
      returnAmount,
      employeeId,
      isCancleLate = false,
    } = req.body;

    try {
      const cancleTicket = await ticketService.cancleTicket(
        ticketId,
        returnAmount,
        note,
        employeeId,
        isCancleLate
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
    const { page, size } = req.query;

    try {
      const listTicket = await ticketService.getTicketRefundByUserId(userId);

      if (page && size) {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          listTicket
        );
        return res.json({ data: arrPagination, totalPages });
      } else {
        return res.json({ data: listTicket, totalPages: null });
      }
    } catch (error) {
      next(error);
    }
  }
  // get all ticket refund  with query parameters
  async getAllTicketRefund(req, res, next) {
    const { page = "", size = "", name = "", phone = "" } = req.query;
    const { depId = "", desId = "", date = "", dateCreate = "" } = req.query;
    try {
      var tickets = [];
      const listTicket = await TicketService.getAllTicketRefund();
      if (name != "" && phone == "") {
        const customer = await Customer.find({ $text: { $search: name } });
        for (const elem of customer) {
          const customerFind = await TicketService.getTicketRefundByUserId(
            elem._id
          );
          if (customerFind?.length > 0) {
            tickets.push(...customerFind);
          }
        }
      } else if (phone != "" && name == "") {
        const customer = await Customer.findOne({ phoneNumber: phone });
        if (!customer) {
          return res.json({ listTicketResult: [], totalPages: null });
        } else if (dateCreate != "") {
          tickets = [];
          listTicket.forEach((element) => {
            if (
              new Date(element.date).toLocaleDateString() ===
              new Date(dateCreate).toLocaleDateString()
            ) {
              tickets.push(element);
            }
          });
          const listResult = [];
          if (tickets && tickets.length > 0) {
            for (const elem of tickets) {
              if (elem.idCustomer.toString() == customer._id.toString()) {
                listResult.push(elem);
              }
            }
          }
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            listResult
          );

          return res.json({ listTicketResult: arrPagination, totalPages });
        } else {
          tickets = await ticketService.getTicketRefundByUserId(customer._id);
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            tickets
          );

          return res.json({ listTicketResult: arrPagination, totalPages });
        }
      } else {
        tickets = await TicketService.getAllTicketRefund();
      }

      if (dateCreate != "") {
        tickets = [];
        listTicket.forEach((element) => {
          if (
            new Date(element.date).toLocaleDateString() ===
            new Date(dateCreate).toLocaleDateString()
          ) {
            tickets.push(element);
          }
        });
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          tickets
        );

        return res.json({ listTicketResult: arrPagination, totalPages });
      }

      if (desId !== "" && depId !== "") {
        tickets = [];
        if (date !== "") {
          listTicket.forEach((element) => {
            if (
              element.destination._id.toString() == desId &&
              element.departure._id.toString() == depId &&
              new Date(element.startDate).toLocaleDateString() ===
                new Date(date).toLocaleDateString()
            ) {
              tickets.push(element);
            }
          });
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            tickets
          );

          return res.json({ listTicketResult: arrPagination, totalPages });
        } else {
          listTicket.forEach((element) => {
            if (
              element.destination._id.toString() == desId &&
              element.departure._id.toString() == depId
            ) {
              tickets.push(element);
            }
          });
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            tickets
          );

          return res.json({ listTicketResult: arrPagination, totalPages });
        }
      } else if (date !== "") {
        tickets = [];
        listTicket.forEach((element) => {
          if (
            new Date(element.startDate).toLocaleDateString() ===
            new Date(date).toLocaleDateString()
          ) {
            tickets.push(element);
          }
        });
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          tickets
        );

        return res.json({ listTicketResult: arrPagination, totalPages });
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
    const {
      startDate = null,
      endDate = null,
      page,
      size,
      name = "",
    } = req.query;
    const arrayFinal = [];
    try {
      const listTicket = await ticketService.statisticTicketByCustomer();

      for (const ticket of listTicket) {
        var totalDiscount = 0;
        if (ticket.promotionresults?.length > 0) {
          for (const promotionResult of ticket.promotionresults) {
            totalDiscount += promotionResult.discountAmount;
          }
        }
        const total = ticket.prices * ticket.chair?.length;
        const totalAfterDiscount = total - totalDiscount;

        arrayFinal.push({
          customer: ticket.customer,
          customerType: ticket.customerType,
          totalDiscount: totalDiscount,
          totalAfterDiscount: totalAfterDiscount,

          total: total,
          date: ticket.date,
          quantity: ticket.quantity,
          route: {
            departure: ticket.departure,
            destination: ticket.destination,
          },
        });
      }
      arrayFinal.sort((a, b) => {
        return (
          Number(a.customer.code.substring(2)) -
          Number(b.customer.code.substring(2))
        );
      });
      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayFinal
        );
        if (startDate && endDate) {
          const arrayList = [];

          for (const elem of arrayFinal) {
            if (
              new Date(elem.date) >= new Date(startDate) &&
              new Date(elem.date) <= new Date(endDate)
            ) {
              arrayList.push(elem);
            }
          }
          if (name != "") {
            const employee = await Customer.find({
              $text: { $search: name },
            });
            var namefind = employee[0];
            if (employee && employee.length > 1) {
              for (const elm of employee) {
                const nameCus = `${elm.firstName} ${elm.lastName}`;

                if (nameCus.toLowerCase() == name.toLowerCase()) {
                  namefind = elm;
                  break;
                }
              }
            }
            const arrayListCus = [];
            if (employee) {
              for (const elem of arrayList) {
                if (elem.customer._id.toString() === namefind._id.toString()) {
                  arrayListCus.push(elem);
                }
              }
              const { arrPagination, totalPages } =
                await utilsService.pagination(
                  parseInt(page),
                  parseInt(size),
                  arrayListCus
                );
              return res.json({
                data: arrPagination,
                messages: "success",
                totalPages,
              });
            } else {
              const { arrPagination, totalPages } =
                await utilsService.pagination(
                  parseInt(page),
                  parseInt(size),
                  arrayListCus
                );
              return res.json({
                data: arrPagination,
                messages: "success",
                totalPages,
              });
            }
          } else {
            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              arrayList
            );
            res.json({ data: arrPagination, messages: "success", totalPages });
          }
        } else {
          res.json({ data: arrPagination, messages: "success", totalPages });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // statistic ticket by employee
  async statisticTicketByAllEmployee(req, res, next) {
    const {
      startDate = null,
      endDate = null,
      page,
      size,
      name = "",
    } = req.query;
    const arrayFinal = [];
    const arrayResult = [];
    try {
      const listTicket = await ticketService.statisticTicketByEmployee();

      for (const empl of listTicket) {
        for (const e of empl.ticket) {
          if (e.employee.length > 0) {
            e.employee = e.employee[0];
          } else {
            e.employee = {
              _id: null,
            };
          }
        }
      }
      for (const ticket of listTicket) {
        const result = ticket.ticket.reduce((array, item) => {
          array[item.employee._id] = array[item.employee._id] || [];
          array[item.employee._id].push(item);
          return array;
        }, Object.create(null));

        const propertyValues = Object.values(result);
        arrayFinal.push(propertyValues);
      }

      for (const elem of arrayFinal) {
        for (const emplTicket of elem) {
          //   console.log(emplTicket[0]);
          var totalDiscount = 0;
          var total = 0;
          var date = "";
          for (const item of emplTicket) {
            if (item.promotionresults?.length > 0) {
              for (const promotionResult of item.promotionresults) {
                totalDiscount += promotionResult.discountAmount;
              }
            }
            total += item.prices * item.chair?.length;

            date = item.date;
          }
          arrayResult.push({
            date: date,
            totalDiscount: totalDiscount,
            total,
            totalAfterDiscount: total - totalDiscount,
            employee: emplTicket[0].employee,
          });
        }
      }
      arrayResult.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayResult
        );

        if (startDate && endDate) {
          const arrayList = [];
          for (const elem of arrayResult) {
            if (
              new Date(elem.date) >= new Date(startDate) &&
              new Date(elem.date) <= new Date(endDate)
            ) {
              arrayList.push(elem);
            }
          }

          if (name != "") {
            const employee = await Employee.findOne({
              $text: { $search: name },
            });

            const arrayListEml = [];
            if (employee) {
              for (const elem of arrayList) {
                if (
                  elem.employee?._id?.toString() === employee._id.toString()
                ) {
                  arrayListEml.push(elem);
                }
              }

              const { arrPagination, totalPages } =
                await utilsService.pagination(
                  parseInt(page),
                  parseInt(size),
                  arrayListEml
                );
              return res.json({
                data: arrPagination,
                messages: "success",
                totalPages,
              });
            } else {
              const { arrPagination, totalPages } =
                await utilsService.pagination(
                  parseInt(page),
                  parseInt(size),
                  arrayListEml
                );
              return res.json({
                data: arrPagination,
                messages: "success",
                totalPages,
              });
            }
          } else {
            const { arrPagination, totalPages } = await utilsService.pagination(
              parseInt(page),
              parseInt(size),
              arrayList
            );
            res.json({ data: arrPagination, messages: "success", totalPages });
          }
        } else {
          res.json({ data: arrPagination, messages: "success", totalPages });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // statistic revenue month (dastboard)
  async revenueStatisticsMonth(req, res, next) {
    const arrayTicketTotal = [];
    const arrayFinal = [];
    const arrayStatistic = [];
    const arrayTopRoute = [];
    var quantityRefunds = 0;
    try {
      const listTicket = await statisticServie.revenueStatistics(
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );

      const listTicketRefund = await statisticServie.getTotalRefundAmount(
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );

      if (listTicketRefund && listTicketRefund.length > 0) {
        for (const elemRefund of listTicketRefund) {
          quantityRefunds += elemRefund.count;

          if (elemRefund.ticketRefunds.length > 1) {
            for (const e of elemRefund.ticketRefunds) {
              if (e.isCancleLate == false) {
                arrayTicketTotal.push({
                  date: e.date,
                  totalAmount: 0,
                  totalAmountRefund: e.returnAmount,
                });
              }
            }
          } else {
            if (elemRefund.ticketRefunds[0].isCancleLate == false) {
              arrayTicketTotal.push({
                date: elemRefund.ticketRefunds[0].date,
                totalAmount: 0,
                totalAmountRefund: elemRefund.returnAmount,
              });
            }
          }
        }
      }
      var quantityTicket = 0;
      if (listTicket.length > 0 && listTicket) {
        for (const elem of listTicket) {
          var total = 0;
          for (const elemTicket of elem.ticket) {
            total += await utilsService.totalAmountTicket(
              elemTicket.chair,
              elemTicket.prices,
              elemTicket.promotionresults
            );
            quantityTicket += elemTicket.chair.length;
          }
          arrayTicketTotal.push({
            date: elem.ticket[0]?.date,
            totalAmount: total,
            totalAmountRefund: 0,
          });
        }
      }
      arrayFinal.push({
        date: arrayTicketTotal[0]?.date,
        totalAmountRefund: arrayTicketTotal[0]?.totalAmountRefund,
        totalAmount: arrayTicketTotal[0]?.totalAmount,
      });

      const result = arrayTicketTotal.reduce((array, item) => {
        array[item.date] = array[item.date] || [];
        array[item.date].push(item);
        return array;
      }, Object.create(null));

      const propertyValues = Object.values(result);

      if (propertyValues) {
        for (const elem of propertyValues) {
          var totalAmount = 0;
          var totalAmountRefund = 0;
          if (elem.length > 1) {
            for (const item of elem) {
              totalAmount += item.totalAmount;
              totalAmountRefund += item.totalAmountRefund;
            }
          } else {
            totalAmount = elem[0].totalAmount;
            totalAmountRefund = elem[0].totalAmountRefund;
          }
          arrayStatistic.push({
            date: elem[0].date,
            totalAmount: totalAmount,
            totalAmountRefund: totalAmountRefund,
          });
        }
      }

      arrayStatistic.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      var totalAmountMonth = 0;
      var totalAmountRefundMonth = 0;
      if (arrayStatistic && arrayStatistic.length > 0) {
        for (const elem of arrayStatistic) {
          totalAmountMonth += elem.totalAmount;
          totalAmountRefundMonth += elem.totalAmountRefund;
        }
      }
      const listTopRoute = await statisticServie.getTopRouteOfMonth(
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );
      if (listTopRoute) {
        for (const elem of listTopRoute) {
          const route = await Route.findOne(
            {
              "departure._id": elem._id.departure,
              "destination._id": elem._id.destination,
            },
            {
              "departure.name": 1,
              "destination.name": 1,
              code: 1,
            }
          );
          arrayTopRoute.push({ route, quantityTicket: elem.count });
        }
      }

      res.json({
        revenue: arrayStatistic,
        quantityTicket,
        quantityRefunds,
        totalAmountMonth,
        totalAmountRefundMonth,
        month: new Date().getMonth() + 1,
        listTopRoute: arrayTopRoute,
      });
    } catch (error) {
      next(error);
    }
  }
  // statistic ticket refunds
  async statisticTicketRefunds(req, res, next) {
    const { startDate = null, endDate = null, page, size } = req.query;
    const arrayFinal = [];
    try {
      const listRefund = await statisticServie.getInfoStatisticTicketRefund();
      if (listRefund && listRefund.length > 0) {
        for (const elem of listRefund) {
          var totalDiscount = 0;
          const route = await Route.findOne({
            "departure._id": elem.vehicleRoute.departure,

            "destination._id": elem.vehicleRoute.destination,
          });
          totalDiscount = await utilsService.totalDiscount(
            elem.promotionResult
          );

          if (route) {
            arrayFinal.push({
              _id: elem._id,
              ticketRefund: elem.ticketRefund,
              ticket: elem.ticket,
              route: {
                name: `${route.departure.name} - ${route.destination.name}`,
                code: route.code,
              },
              totalDiscount,
              totalBeforDiscount:
                totalDiscount + elem.ticketRefund.returnAmount,
            });
          }
        }
      }
      if (page != "" && size != "") {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          arrayFinal
        );
        if (startDate && endDate) {
          const arrayList = [];
          for (const elem of arrayFinal) {
            if (
              new Date(elem.ticketRefund.dateTiketRefund) >=
                new Date(startDate) &&
              new Date(elem.ticketRefund.dateTiketRefund) <= new Date(endDate)
            ) {
              arrayList.push(elem);
            }
          }
          const { arrPagination, totalPages } = await utilsService.pagination(
            parseInt(page),
            parseInt(size),
            arrayList
          );
          res.json({ data: arrPagination, messages: "success", totalPages });
        } else {
          res.json({ data: arrPagination, messages: "success", totalPages });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // statistic current date (dastboard)
  async statictisCurrentDate(req, res, next) {
    try {
      var totalAmount = 0;
      const listTicketCurrent = await statisticServie.countTicketByCurrenDate(
        moment(new Date()).utcOffset(420).format("yyyy/MM/DD")
      );
      var countTicketCancle = 0;
      if (listTicketCurrent && listTicketCurrent[0]?.ticket.length > 0) {
        for (const elem of listTicketCurrent[0].ticket) {
          totalAmount += await utilsService.totalAmountTicket(
            elem.chair,
            elem.prices,
            elem.promotionResults
          );

          if (elem.isCancleLate) {
            countTicketCancle += elem.chair.length;
          }
        }
      }

      const listRefunds = await statisticServie.countTicketRefundByCurrenDate(
        moment(new Date()).utcOffset(420).format("yyyy/MM/DD")
      );

      const listCustomer = await statisticServie.countCustomerCurrenDate(
        moment(new Date()).utcOffset(420).format("yyyy/MM/DD")
      );

      const statictis = {
        quantityTicket: listTicketCurrent[0]?.countTicket
          ? listTicketCurrent[0].countTicket - countTicketCancle
          : 0,
        totalAmount: totalAmount,
        quantityRefunds: listRefunds[0]?.count ? listRefunds[0]?.count : 0,
        quantityCustomer: listCustomer.length,
      };
      res.json({ data: statictis, message: "success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();
