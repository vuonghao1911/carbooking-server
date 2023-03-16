const router = require("express").Router();
const uploadFile = require("../middleware/uploadFile");
const promotionController = require("../controllers/PromotionController");
// add promotion Line and add promotionDetails
router.post("/addPromotion", promotionController.addPromotions);
// get list promotion by Id promotionHeader
router.get("/all/getPromotion/:idProHeader", promotionController.getPromotion);
router.post("/addPromotionType", promotionController.addPromotionType);
router.get("/all/getPromotionType", promotionController.getPromotionType);
router.post("/addPromotionResult", promotionController.addPromotionResult);
router.post(
  "/addPromotionHeader",
  uploadFile.uploadFileMiddleware,
  promotionController.addPromotionHeader
);
// get list Promotion by currentDate --- mobile
router.get(
  "/all/getPromotionCurrenDate",
  promotionController.getPromotionByCurrentDate
);
// get list promotionHeader
router.get("/all/getPromotionHeader", promotionController.getPromotionHeader);
// update status and endDate promotionHeader
router.patch("/updateHeader", promotionController.updatePromotionHeader);
// update status and endDate promotionLine
router.patch("/updateLine", promotionController.updatePromotionLine);

module.exports = router;
