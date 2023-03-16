const router = require("express").Router();
const accountController = require("../controllers/AccountController");

router.post("/register", accountController.Register);
router.post("/login", accountController.Login);
router.post("/changePass", accountController.ChangePass);
router.post("/forgot", accountController.forgotPass);

module.exports = router;
