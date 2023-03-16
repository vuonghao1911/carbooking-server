const employeeService = require("../services/EmployeeService");
const Employee = require("../modal/Employee");
const EmployeeType = require("../modal/EmployeeType");
class EmployeeController {
  async addEmployeeType(req, res, next) {
    const { name } = req.body;
    //console.log(number);
    try {
      const employeeType = new EmployeeType({
        type: name,
      });

      const saveEmp = await employeeService.saveEmployeeType(employeeType);
      console.log(saveEmp);
      return res.json(saveEmp);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getEmployeeType(req, res, next) {
    try {
      const getTypeEmp = await employeeService.getEmployeeType(req, res, next);
      return res.json(getTypeEmp);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getEmployee(req, res, next) {
    try {
      const getEmps = await Employee.find();
      return res.json(getEmps);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCustomerById(req, res, next) {
    const { userId } = req.params;
    console.log(userId);

    try {
      const customer = await Customer.findById(userId);

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  async addEmployee(req, res, next) {
    const { firstName, lastName, phoneNumber, typeId, address } = req.body;
    //console.log(number);
    const codeFind = await Employee.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }
    try {
      const employee = new Employee({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        typeId: typeId,
        address: address,
        code: code + 1,
      });

      const saveEmp = await employeeService.saveEmployee(employee);
      console.log(saveEmp);
      return res.json(saveEmp);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new EmployeeController();
