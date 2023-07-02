const router = require("express").Router();
const accountController = require("../controllers/AccountController");
// register (employee defaults password 111111)
router.post("/register", accountController.Register);
router.post("/login", accountController.Login);
router.post("/changePass", accountController.ChangePass);
router.post("/forgot", accountController.forgotPass);
router.post("/sendOtp", accountController.sendPhoneOTP);
router.post("/verifyOtp", accountController.verifyPhoneOTP);
router.post("/reset-accessToken", accountController.resetRefreshToken);

module.exports = router;
