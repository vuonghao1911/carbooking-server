const Account = require("../modal/Account");
const bcrypt = require("bcrypt");

const AccountService = {
  saveAccount: async (account) => {
    return await account.save();
  },

  checklogin: async (passWord, phoneNumber) => {
    return await Account.findOne({
      $and: [{ phoneNumber: phoneNumber }, { passWord: passWord }],
    });
  },

  checkPhoneNumber: async (phoneNumber) => {
    return await Account.findOne({
      phoneNumber: phoneNumber,
    });
  },

  generateSalt: async () => {
    return await bcrypt.genSalt();
  },

  hashPassword: async (password, salt) => {
    return await bcrypt.hash(password, salt);
  },

  comparePassword: async (passWord, passWordHash) => {
    return await bcrypt.compare(passWord, passWordHash);
  },
};

module.exports = AccountService;
