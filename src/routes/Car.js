const router = require("express").Router();
const carController = require("../controllers/CarController");

router.post("/addCarType", carController.addCarType);
router.get("/all/getCarType", carController.getCarType);
router.post("/addCar", carController.addCar);
router.get("/all/getCars", carController.getCar);

router.get("/:id", carController.getCarById);

module.exports = router;
