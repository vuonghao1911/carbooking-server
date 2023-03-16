const customerService = require("../services/customerService");
const AwsS3Service = require("../services/AwsS3Service");
const Customer = require("../modal/Customer");
const CustomerType = require("../modal/CustomerType");
class CustomerController {
  async addCustomer(req, res, next) {
    const { firstName, lastName, phoneNumber, address } = req.body;
    const codeFind = await Customer.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = 0;
    }

    //console.log(number);
    try {
      const customer = new Customer({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        address: address,
        code: code + 1,
      });

      const savecustomer = await customerService.addCustomer(customer);
      console.log(savecustomer);
      return res.json(savecustomer);
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
  async addCustomerType(req, res, next) {
    const { code, type, description } = req.body;

    try {
      const departureTime = new CustomerType({
        code: code,
        type: type,
        description: description,
      });
      const newDepartureTime = await departureTime.save();

      res.json(newDepartureTime);
    } catch (error) {
      next(error);
    }
  }
  async getCustomer(req, res, next) {
    try {
      const customer = await Customer.aggregate([
        {
          $lookup: {
            from: "tickets",
            localField: "_id",
            foreignField: "customerId",
            as: "tickets",
          },
        },
        {
          $project: {
            _id: "$_id",
            firstName: "$firstName",
            lastName: "$lastName",
            phoneNumber: "$phoneNumber",
            address: "$address",
            quantityTicket: { $size: "$tickets" },
          },
        },
      ]);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async updateInfo(req, res, next) {
    const { firstName, lastName, phoneNumber, id } = req.body;
    //console.log(number);
    try {
      await Customer.updateOne(
        { _id: id },
        {
          $set: {
            lastName: lastName,
            firstName: firstName,
            phoneNumber: phoneNumber,
          },
        }
      );
      const customer = await Customer.findById(id);
      return res.json(customer);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCustomerByPhoneNumber(req, res, next) {
    const { phone = "" } = req.query;
    //console.log(number);
    try {
      const customer = await customerService.getCustomerByPhone(phone);
      return res.json(customer);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async uploadFine(req, res, next) {
    const file = req.file;
    //console.log(number);
    try {
      console.log(file);
      const location = await AwsS3Service.uploadFile(file);
      return res.json({ locationFile: location });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new CustomerController();
