const customerService = require("../services/customerService");
const utilsService = require("../utils/utils");
const AwsS3Service = require("../services/AwsS3Service");
const Customer = require("../modal/Customer");
const CustomerType = require("../modal/CustomerType");
class CustomerController {
  // add customer
  async addCustomer(req, res, next) {
    const { firstName, lastName, phoneNumber, address, email, dateOfBirth } =
      req.body;
    const codeFind = await Customer.find().sort({ _id: -1 }).limit(1);
    var code;
    if (codeFind[0]) {
      code = codeFind[0].code;
    } else {
      code = "KH00";
    }
    var code1 = "";
    var codeString = code.substring(2);

    var codeEmpl = Number(codeString) + Number(1);

    if (Number(codeString) < 9) {
      code1 = `KH0${codeEmpl}`;
    } else {
      code1 = `KH${codeEmpl}`;
    }

    try {
      const customer = new Customer({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        address: address,
        email: email,
        dateOfBirth: dateOfBirth,
        code: code1,
        customerTypeId: ObjectId("640e9859186ba7d1aee14307"),
      });

      const savecustomer = await customerService.addCustomer(customer);

      return res.json(savecustomer);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  // get customer by id
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
  // add customer type
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
  // get customer type
  async getCustomerType(req, res, next) {
    try {
      const type = await CustomerType.find();

      res.json(type);
    } catch (error) {
      next(error);
    }
  }
  // get customer by query parameters
  async getCustomer(req, res, next) {
    const { page, size, name = "", phone = "" } = req.query;
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
          $lookup: {
            from: "customertypes",
            localField: "customerTypeId",
            foreignField: "_id",
            as: "customertypes",
          },
        },
        {
          $unwind: "$customertypes",
        },
        {
          $project: {
            _id: "$_id",
            firstName: "$firstName",
            lastName: "$lastName",
            phoneNumber: "$phoneNumber",
            address: "$address",
            email: "$email",
            dob: "$dateOfBirth",
            customerType: "$customertypes.type",
            code: "$code",
            quantityTicket: { $size: "$tickets" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
      if (name != "" && phone == "") {
        const customer = await Customer.find({ $text: { $search: name } });
        return res.json({ data: customer, totalPages: null });
      } else if (phone != "" && name == "") {
        const customer = await Customer.find({ phoneNumber: phone });
        return res.json({ data: customer, totalPages: null });
      }

      if (page && size) {
        const { arrPagination, totalPages } = await utilsService.pagination(
          parseInt(page),
          parseInt(size),
          customer
        );
        return res.json({ data: arrPagination, totalPages });
      }
    } catch (error) {
      next(error);
    }
  }
  // update info customer
  async updateInfo(req, res, next) {
    const {
      firstName,
      lastName,
      id,
      address,
      dateOfBirth,
      email,
      status = true,
    } = req.body;
    //console.log(number);
    try {
      await Customer.updateOne(
        { _id: id },
        {
          $set: {
            lastName: lastName,
            firstName: firstName,
            address: address,
            email: email,
            dateOfBirth: dateOfBirth,
            status: status,
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
  // get customer by phone
  async getCustomerByPhoneNumber(req, res, next) {
    const { phone = "" } = req.query;
    //console.log(number);
    var message = "success";
    try {
      const customer = await customerService.getCustomerByPhone(phone);

      if (customer) {
        return res.json({ customer, message });
      } else {
        return res.json({ customer: null, message: "customer not found" });
      }
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
  // update customer type
  async updateCustomerType(req, res, next) {
    const { id, type, description } = req.body;
    //console.log(number);
    try {
      await CustomerType.updateOne(
        { _id: id },
        {
          $set: {
            type: type,
            description: description,
          },
        }
      );
      const customer = await CustomerType.findById(id);
      return res.json(customer);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = new CustomerController();
