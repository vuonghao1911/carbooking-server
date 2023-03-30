const router = require("express").Router();
const paymentController = require("../controllers/PaymentController");

router.post("/zalopay", paymentController.paymentZaloPay);
router.post("/getStatus", paymentController.getStatusPayment);

module.exports = router;
