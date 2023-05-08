const router = require("express").Router();
const vehicleRouteController = require("../controllers/VehicleRouteController");

router.post("/addRoute", vehicleRouteController.addVehicleRoute);
router.post("/addRouteType", vehicleRouteController.addRouteType);
router.post("/addTime", vehicleRouteController.addDepartureTime);
//searchRoute
router.post("/searchRoute", vehicleRouteController.searchVehicleRoute);
//get list vehicle routes by idroute
router.get("/all/:routeId", vehicleRouteController.getVehicleRoute);
// get list Car Unique with Route, StartDate, TimeDeparture
router.post("/getCarRoute", vehicleRouteController.getCarRoute);
// get list ticket and list chair vehicle by id vehicle
router.get(
  "/getTicketVehice/:vehicleId",
  vehicleRouteController.getListTicketByIdVehicleRoute
);
// get list vehicleRoute unique by start date and departure,destination (quan ly chhuyen xe)
// chuyen xe header
router.get(
  "/getVehiceCurrenDate",
  vehicleRouteController.getListVehicleRouteCurrenDate
);
// get list vehicleRoute current date
router.get("/listVehicleCurrent", vehicleRouteController.getVehicleRouteByDate);
module.exports = router;
