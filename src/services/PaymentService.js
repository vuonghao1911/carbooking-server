const Car = require("../modal/Car");
const CarType = require("../modal/CarType");
const VehicleRoute = require("../modal/VehicleRoute");
var mongoose = require("mongoose");
const Customer = require("../modal/Customer");
const TicketService = require("./TicketService");
const Ticket = require("../modal/Ticket");
const ObjectId = require("mongoose").Types.ObjectId;
// car and car type services

const PaymentService = {
  async bookingTicket({
    vehicleRouteId,
    customer,
    quantity,
    chair,
    locationBus,
    phoneNumber,
    promotion,
    priceId,
  }) {
    var code = new Date().getTime();

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

        const saveticket = await TicketService.saveTicket(
          vehicleRouteId,
          newCustomer._id,
          quantity,
          chair,
          locationBus,
          phoneNumber,
          promotion,
          code,
          priceId
        );
        return saveticket;
      } else {
        const customerFind = await Customer.findOne({
          phoneNumber: phoneNumber,
        });

        const saveticket = await TicketService.saveTicket(
          vehicleRouteId,
          customerFind._id,
          quantity,
          chair,
          locationBus,
          phoneNumber,
          promotion,
          code,
          priceId
        );

        return saveticket;
      }
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = PaymentService;
