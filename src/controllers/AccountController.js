const AccountService = require("../services/AccountService");
const EmployeeService = require("../services/EmployeeService");
const CustomerService = require("../services/customerService");
const Account = require("../modal/Account");
const Employee = require("../modal/Employee");
const Customer = require("../modal/Customer");
const { truncate } = require("fs/promises");

class AccountController {
  async Register(req, res, next) {
    const {
      role,
      phoneNumber,
      passWord,
      firstName,
      lastName,
      address,
      typeId,
    } = req.body;

    var newAccount;

    try {
      const checkRegister = await AccountService.checkPhoneNumber(phoneNumber);
      const salt = await AccountService.generateSalt();
      const passHash = await AccountService.hashPassword(passWord, salt);
      const customerFind = await Customer.findOne({ phoneNumber: phoneNumber });
      if (checkRegister != null) {
        return res.json({ checkRegister: false });
      } else {
        if (role) {
          const employee = new Employee({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            typeId: typeId,
            address: address,
          });
          const user = await EmployeeService.saveEmployee(employee);

          const account = new Account({
            phoneNumber: phoneNumber,
            passWord: passHash,
            role: role,
            idUser: user._id,
          });
          const saveAccount = await AccountService.saveAccount(account);
          newAccount = { user: user, checkRegister: true };
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
}

module.exports = new AccountController();
