const route = (app) => {
  const customerRouter = require("./Customer");
  const carRouter = require("./Car");
  const vehicleRoute = require("./VehicleRoute");
  const employeeRoute = require("./Employee");
  const placeRoute = require("./Place");
  const ticketRoute = require("./Ticket");
  const promotionRoute = require("./Promotion");
  const accountRoute = require("./Account");
  const priceRoute = require("./Price");

  app.use("/customers", customerRouter);
  app.use("/cars", carRouter);
  app.use("/routes", vehicleRoute);
  app.use("/employees", employeeRoute);
  app.use("/places", placeRoute);
  app.use("/tickets", ticketRoute);
  app.use("/promotions", promotionRoute);
  app.use("/", accountRoute);
  app.use("/prices", priceRoute);
};

module.exports = route;
