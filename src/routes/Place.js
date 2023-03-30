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

//router.get("/:id", carController.getCarById);

module.exports = router;
