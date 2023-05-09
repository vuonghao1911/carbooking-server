const employeeService = require("../services/EmployeeService");
const utilsService = require("../utils/utils");
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
    const { page, size, name = "", phone = "" } = req.query;
    try {
      const getEmps = await Employee.find().sort({ _id: -1 });
      if (name != "" && phone == "") {
        const customer = await Employee.find({ $text: { $search: name } });
        return res.json({ data: customer, totalPages: null });
      } else if (phone != "" && name == "") {
        const customer = await Employee.find({ phoneNumber: phone });
        return res.json({ data: customer, totalPages: null });
      }

      if (page && size) {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          getEmps
        );
        return res.json({ data: arrPagination, totalPages });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getEmployeeById(req, res, next) {
    const { userId } = req.params;

    try {
      const customer = await Employee.findById(userId);

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
  async addEmployee(req, res, next) {
    const {
      firstName,
      lastName,
      phoneNumber,
      typeId,
      address,
      role,
      dateOfBirth,
      email,
    } = req.body;
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
        role: role,
        code: code + 1,
        email: email,
        dateOfBirth: dateOfBirth,
      });

      const saveEmp = await employeeService.saveEmployee(employee);
      console.log(saveEmp);
      return res.json(saveEmp);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  // update employee
  async updateEmloyee(req, res, next) {
    const {
      firstName,
      lastName,
      phoneNumber,
      typeId,
      address,
      status,
      id,
      dateOfBirth,
      email,
    } = req.body;
    try {
      await Employee.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            status: status,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            typeId: typeId,
            address: address,
            email: email,
            dateOfBirth: dateOfBirth,
          },
        }
      );
      return res.json({ message: "success" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new EmployeeController();
