const AccountService = require("../services/AccountService");
const EmployeeService = require("../services/EmployeeService");
const CustomerService = require("../services/customerService");
const JwtService = require("../services/JwtService");
const Account = require("../modal/Account");
const Employee = require("../modal/Employee");
const Customer = require("../modal/Customer");
const { jwt } = require("twilio");
const ObjectId = require("mongoose").Types.ObjectId;
const twilio = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

class AccountController {
  // register (employee defaults password 111111)
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
      email,
      dob,
      gender,
    } = req.body;

    var newAccount;

    try {
      const checkRegister = await AccountService.checkPhoneNumber(phoneNumber);
      const salt = await AccountService.generateSalt();
      const passHash = await AccountService.hashPassword(passWord, salt);
      const customerFind = await Customer.findOne({ phoneNumber: phoneNumber });
      var employeeFind = await Employee.findOne({ phoneNumber: phoneNumber });
      // find code customer
      const codeFind = await Customer.find().sort({ _id: -1 }).limit(1);
      var code;
      if (codeFind[0]) {
        code = codeFind[0].code;
      } else {
        code = "KH00";
      }
      var code1 = "";
      var codeString = code.substring(2);

      var codeCus = Number(codeString) + Number(1);

      if (Number(codeString) < 9) {
        code1 = `KH0${codeCus}`;
      } else {
        code1 = `KH${codeCus}`;
      }
      // find code employee
      const codeFindEmpl = await Employee.find().sort({ _id: -1 }).limit(1);
      var codeEml;

      if (codeFindEmpl[0]) {
        codeEml = codeFindEmpl[0].code;
      } else {
        codeEml = "NV00";
      }
      var code2 = "";
      var codeStringEml = codeEml.substring(2);

      var codeEmpl = Number(codeStringEml) + Number(1);

      if (Number(codeStringEml) < 9) {
        code2 = `NV0${codeEmpl}`;
      } else {
        code2 = `NV${codeEmpl}`;
      }

      if (checkRegister != null) {
        return res.json({ checkRegister: false });
      } else {
        if (role) {
          const passDefault = await AccountService.hashPassword(
            process.env.PASSWORD_DEFAULT,
            salt
          );
          var account;
          if (employeeFind) {
            account = new Account({
              phoneNumber: phoneNumber,
              passWord: passDefault,
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
              email: email,
              dateOfBirth: dob,
              gender: gender,
              code: code2,
            });
            employeeFind = await EmployeeService.saveEmployee(employee);

            account = new Account({
              phoneNumber: phoneNumber,
              passWord: passDefault,
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
            customerTypeId: ObjectId("640e9859186ba7d1aee14307"),
            code: code1,
          });
          const user = await CustomerService.addCustomer(customer);
          const account = new Account({
            phoneNumber: phoneNumber,
            passWord: passHash,
            role: role,
            idUser: user._id,
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
        const payload = {
          id: userLogin.idUser,
          role: userLogin.role,
        };
        const jwt = await JwtService.signAccessTokenService(payload);
        const refreshToken = await JwtService.signRefreshTokenService(payload);
        console.log(jwt);

        if (passCompare) {
          if (userLogin.role) {
            const employee = await Employee.findById(userLogin.idUser);
            if (employee.status == false) {
              return res.json({
                checklogin: false,
                isActive: false,
                message: "Tài khoản không hợp lệ",
              });
            }
            if (employee?.isActive == false) {
              return res.json({
                checklogin: false,
                isActive: false,
                message: "Tài khoản chưa được active verify otp để active",
              });
            }

            user = {
              user: employee,
              role: userLogin.role,
              checklogin: true,
              isActive: true,
              accessToken: jwt,
              refreshToken: refreshToken,
            };
          } else {
            const customer = await Customer.findById(userLogin.idUser);
            user = {
              user: customer,
              role: userLogin.role,
              checklogin: true,
              isActive: true,
              accessToken: jwt,
              refreshToken: refreshToken,
            };
          }
        } else {
          res.json({ checklogin: false, message: "Sai mật khẩu" });
        }
      } else {
        res.json({ checklogin: false, message: "Không tìm thấy tài khoản" });
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
        res.json({ checkChangePass: false, message: "fail" });
      } else {
        const passCompare = await AccountService.comparePassword(
          oldPass,
          account.passWord
        );
        if (passCompare) {
          if (account.role) {
            const employee = await Employee.findOne({
              phoneNumber: phoneNumber,
            });
            if (employee?.isActive == false) {
              return res.json({
                checkChangePass: false,
                message: "Tài khoản chưa được active verify otp để active",
              });
            }
          }
          const salt = await AccountService.generateSalt();
          const passHash = await AccountService.hashPassword(newPass, salt);
          await Account.updateOne(
            { phoneNumber: phoneNumber },
            { $set: { passWord: passHash } }
          );
          res.json({ checkChangePass: true, message: "Thành công" });
        } else {
          res.json({
            checkChangePass: false,
            message: "Mật khẩu cũ không chính xác",
          });
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
    const { phoneNumber = "", refreshToken = "" } = req.body;

    try {
      await AccountService.sendOTP(phoneNumber);

      res.json({ message: "send otp success" });
    } catch (error) {
      next(error);
    }
  }

  async resetRefreshToken(req, res, next) {
    const { refreshToken = "" } = req.body;

    try {
      if (refreshToken == "") {
        return res.status(400).json({ message: "Invalid refresh token" });
      }
      const verifi = await JwtService.verifyRefreshToken(refreshToken);
      if (verifi) {
        const payload = {
          id: verifi.id,
          role: verifi.role,
        };
        const newAccessToken = await JwtService.signAccessTokenService(payload);
        if (newAccessToken) {
          return res
            .status(200)
            .json({
              message: "reset token successfully",
              accessToken: newAccessToken,
            });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // verify otp
  async verifyPhoneOTP(req, res, next) {
    const { phoneNumber, otp } = req.query;
    try {
      const employee = await Employee.findOne({ phoneNumber: phoneNumber });

      twilio.verify.v2
        .services(process.env.SERVICE_SID)
        .verificationChecks.create({
          to: "+84" + phoneNumber.substring(1),
          code: otp,
        })
        .then((verification) => {
          if (verification.valid) {
            if (employee) {
              Employee.updateOne(
                { _id: employee._id },
                { $set: { isActive: true } }
              ).then(() => {});
            }
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
