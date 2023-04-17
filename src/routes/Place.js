const router = require("express").Router();
const placeController = require("../controllers/PlaceController");

router.post("/addPlace", placeController.addPlace);
router.get("/all/getPlace", placeController.getPlace);
router.post("/addRoute", placeController.addRoute);
router.get("/all/getRoute", placeController.getRoute);
//add busStation
router.post("/addBusStation", placeController.addBusStation);
// update route

router.patch("/updateRoute", placeController.updateRoute);

router.delete("/deleteBusStation", placeController.deleteBusStation);
// statictis route
router.get("/route/statictis", placeController.statictisRouteByDate);
// statictis cartype
router.get("/carType/statictis", placeController.statisticCartypeByDate);

//router.get("/:id", carController.getCarById);

module.exports = router;
