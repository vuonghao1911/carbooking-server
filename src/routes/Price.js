const router = require("express").Router();
const PriceController = require("../controllers/PriceController");

router.post("/addPriceHeader", PriceController.addPriceHeader);
router.post("/addPrice", PriceController.addPrice);
//get list price by priceHeader id
router.get("/all/getPrice/:priceHeaderId", PriceController.getPriceByIdHeader);
//get list priceHeader
router.get("/all/getPriceHeader", PriceController.getPriceHeader);

// update priceHeader
// query startDate, endDate, status
// body idHeader
router.patch("/updateHeader", PriceController.updatePriceHeader);

module.exports = router;
