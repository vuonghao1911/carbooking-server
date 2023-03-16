const router = require("express").Router();
const placeController = require("../controllers/PlaceController");

router.post("/addPlace", placeController.addPlace);
router.get("/all/getPlace", placeController.getPlace);
router.post("/addRoute", placeController.addRoute);
router.get("/all/getRoute", placeController.getRoute);

//router.get("/:id", carController.getCarById);

module.exports = router;
