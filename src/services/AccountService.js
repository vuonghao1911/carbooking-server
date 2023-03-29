const Account = require("../modal/Account");
const bcrypt = require("bcrypt");

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
};

module.exports = AccountService;
