const AccountService = require("../services/AccountService");
const EmployeeService = require("../services/EmployeeService");
const CustomerService = require("../services/customerService");
const Account = require("../modal/Account");
const Employee = require("../modal/Employee");
const Customer = require("../modal/Customer");
const { truncate } = require("fs/promises");
const twilio = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

class AccountController {
  // register
  async Register(req, res, next) {
    const {
      role,
      phoneNumber,
      passWord,
      firstName,
      lastName,
      address,
      typeId,
      roleEmloyee,
    } = req.body;

    var newAccount;

    try {
      const checkRegister = await AccountService.checkPhoneNumber(phoneNumber);
      const salt = await AccountService.generateSalt();
      const passHash = await AccountService.hashPassword(passWord, salt);
      const customerFind = await Customer.findOne({ phoneNumber: phoneNumber });
      var employeeFind = await Employee.findOne({ phoneNumber: phoneNumber });
      if (checkRegister != null) {
        return res.json({ checkRegister: false });
      } else {
        if (role) {
          var account;
          if (employeeFind) {
            account = new Account({
              phoneNumber: phoneNumber,
              passWord: passHash,
              role: role,
              idUser: employeeFind._id,
            });
          } else {
            const employee = new Employee({
              firstName: firstName,
              lastName: lastName,
              phoneNumber: phoneNumber,
              typeId: typeId,
              address: address,
              role: roleEmloyee,
            });
            employeeFind = await EmployeeService.saveEmployee(employee);

            account = new Account({
              phoneNumber: phoneNumber,
              passWord: passHash,
              role: role,
              idUser: employeeFind._id,
            });
          }
          const saveAccount = await AccountService.saveAccount(account);
          newAccount = { user: employeeFind, checkRegister: true };
        } else if (customerFind) {
          const account = new Account({
            phoneNumber: phoneNumber,
            passWord: passHash,
            role: role,
            idUser: customerFind._id,
          });
          const saveAccount = await AccountService.saveAccount(account);
          newAccount = { user: customerFind, checkRegister: true };
        } else {
          const customer = new Customer({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            address: address,
          });
          const user = await CustomerService.addCustomer(customer);
          const account = new Account({
            phoneNumber: phoneNumber,
            passWord: passHash,
            role: role,
            idUser: user._id,
            customerTypeId: "640e9859186ba7d1aee14307",
          });
          const saveAccount = await AccountService.saveAccount(account);
          newAccount = { user: user, checkRegister: true };
        }
      }

      return res.json(newAccount);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  // login
  async Login(req, res, next) {
    const { phoneNumber, passWord } = req.body;

    try {
      const userLogin = await AccountService.checkPhoneNumber(phoneNumber);
      if (userLogin) {
        const passCompare = await AccountService.comparePassword(
          passWord,
          userLogin.passWord
        );
        var user;
        if (passCompare) {
          if (userLogin.role) {
            const employee = await Employee.findById(userLogin.idUser);
            console.log("employee", employee);

            user = { user: employee, role: userLogin.role, checklogin: true };
          } else {
            const customer = await Customer.findById(userLogin.idUser);
            user = { user: customer, role: userLogin.role, checklogin: true };
            console.log("employee", customer);
          }
        } else {
          res.json({ checklogin: false });
        }
      } else {
        res.json({ checklogin: false });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
  // change password
  async ChangePass(req, res, next) {
    const { phoneNumber, newPass, oldPass } = req.body;

    try {
      const account = await AccountService.checkPhoneNumber(phoneNumber);

      if (account == null) {
        res.json({ checkChangePass: false });
      } else {
        const passCompare = await AccountService.comparePassword(
          oldPass,
          account.passWord
        );
        if (passCompare) {
          const salt = await AccountService.generateSalt();
          const passHash = await AccountService.hashPassword(newPass, salt);
          await Account.updateOne(
            { phoneNumber: phoneNumber },
            { $set: { passWord: passHash } }
          );
          res.json({ checkChangePass: true });
        } else {
          res.json({ checkChangePass: false });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // forgotPassword
  async forgotPass(req, res, next) {
    const { phoneNumber, newPass } = req.body;

    try {
      const account = await AccountService.checkPhoneNumber(phoneNumber);

      if (account == null) {
        res.json({ checkForgotPass: false });
      } else {
        const salt = await AccountService.generateSalt();
        const passHash = await AccountService.hashPassword(newPass, salt);
        await Account.updateOne(
          { phoneNumber: phoneNumber },
          { $set: { passWord: passHash } }
        );
        res.json({ checkForgotPass: true });
      }
    } catch (error) {
      next(error);
    }
  }
  // send opt
  async sendPhoneOTP(req, res, next) {
    const { phoneNumber = "" } = req.body;

    try {
      await AccountService.sendOTP(phoneNumber);

      res.json({ message: "message was sent" });
    } catch (error) {
      next(error);
    }
  }
  // verify otp
  async verifyPhoneOTP(req, res, next) {
    const { phoneNumber, otp } = req.query;
    try {
      twilio.verify.v2
        .services(process.env.SERVICE_SID)
        .verificationChecks.create({
          to: "+84" + phoneNumber.substring(1),
          code: otp,
        })
        .then((verification) => {
          if (verification.valid) {
            console.log("vao");

            res.json({ status: true, message: "verify success" });
          } else {
            res.json({ status: false, message: "verify falis" });
          }
        })
        .catch((err) => console.log(err));
    } catch (error) {
      next(error);
      res.status(500).json({
        status: 500,
        message: err.message,
      });
    }
  }
}

module.exports = new AccountController();
