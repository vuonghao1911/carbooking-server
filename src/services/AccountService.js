const Account = require("../modal/Account");
const bcrypt = require("bcrypt");
const twilio = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

const AccountService = {
  // save account
  saveAccount: async (account) => {
    return await account.save();
  },
  // check user login with password and phone number
  checklogin: async (passWord, phoneNumber) => {
    return await Account.findOne({
      $and: [{ phoneNumber: phoneNumber }, { passWord: passWord }],
    });
  },
  // check user is exist with phone number
  checkPhoneNumber: async (phoneNumber) => {
    return await Account.findOne({
      phoneNumber: phoneNumber,
    });
  },
  // genera salt
  generateSalt: async () => {
    return await bcrypt.genSalt();
  },
  // hash password
  hashPassword: async (password, salt) => {
    return await bcrypt.hash(password, salt);
  },
  // compare pass
  comparePassword: async (passWord, passWordHash) => {
    return await bcrypt.compare(passWord, passWordHash);
  },
  async sendOTP(phone) {
    twilio.verify.v2
      .services(process.env.SERVICE_SID)
      .verifications.create({
        to: "+84" + phone.substring(1),
        channel: "sms",
      })
      .then((verification) => console.log(verification))
      .catch((err) => console.log(err));
  },

  async VerifyOTP(otp, phone) {
    var verificationPhone = false;
    twilio.verify.v2
      .services(process.env.SERVICE_SID)
      .verificationChecks.create({
        to: "+84" + phone.substring(1),
        code: otp,
      })
      .then((verification) => {
        if (verification.valid) {
          console.log("vao");
          verificationPhone = true;

          return { status: true, message: "verify success" };
        }
      })
      .catch((err) => console.log(err));
  },
};

module.exports = AccountService;
