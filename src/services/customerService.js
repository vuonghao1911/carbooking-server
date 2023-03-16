const Customer = require("../modal/Customer");

const CustomerService = {
  addCustomer: async (customer) => {
    return await customer.save();
  },
  getCustomerById: async (_id) => {
    return await Customer.findById(_id);
  },
  getCustomerByPhone: async (phoneNumber) => {
    return await Customer.findOne({
      phoneNumber: phoneNumber,
    });
  },
};

module.exports = CustomerService;
