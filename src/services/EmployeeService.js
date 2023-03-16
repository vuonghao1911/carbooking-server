const Employee = require("../modal/Employee");
const EmployeeType = require("../modal/EmployeeType");

// employee and employee type service

const EmployeeService = {
  saveEmployeeType: async (employeeType) => {
    return await employeeType.save();
  },
  getEmployeeType: async (req, res, next) => {
    return await EmployeeType.find();
  },
  getCarById: async (_id) => {
    return await Car.findById(_id);
  },
  saveEmployee: async (employee) => {
    return await employee.save();
  },
};

module.exports = EmployeeService;
