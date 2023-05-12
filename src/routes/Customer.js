const router = require("express").Router();
const customerController = require("../controllers/customerController");
const uploadFile = require("../middleware/uploadFile");

router.post("/add", customerController.addCustomer);
router.post("/addType", customerController.addCustomerType);
router.get("/:userId", customerController.getCustomerById);
router.get("/all/getCustomer", customerController.getCustomer);
router.post("/update", customerController.updateInfo);
router.get("", customerController.getCustomerByPhoneNumber);
router.get("/getType", customerController.getCustomerType);
// update customer type
router.patch("/updateType", customerController.updateCustomerType);
router.post(
  "/file",
  uploadFile.uploadFileMiddleware,
  customerController.uploadFine
);

module.exports = router;
