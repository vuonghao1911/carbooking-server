const router = require("express").Router();
const employeeController = require("../controllers/EmployeeController");

router.post("/addEmployeeType", employeeController.addEmployeeType);
router.get("/all/getEmployeeType", employeeController.getEmployeeType);
router.post("/addEmpl", employeeController.addEmployee);
router.get("/all/getEmployee", employeeController.getEmployee);
// router.get("/:id", carController.getCarById);

module.exports = router;
