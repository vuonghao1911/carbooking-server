const Price = require("../modal/Price");
const PriceHeader = require("../modal/PriceHeader");

// car and car type services

const priceService = {
  // save price
  savePrice: async (price, routeId, carTypeId, code, priceHeaderId) => {
    const newprice = new Price({
      price: price,
      routeId: routeId,
      carTypeId: carTypeId,
      code: code,
      priceHeaderId: priceHeaderId,
    });
    return await newprice.save();
  },
  // save price header
  savePriceHeader: async (startDate, endDate, status, title, code) => {
    const newprice = new Price({
      startDate: startDate,
      endDate: endDate,
      status: status,
      title: title,
      code: code,
    });
    return await newprice.save();
  },
  // check date price header
  checkDatePrice: async (startDate) => {
    const price = await PriceHeader.find({
      endDate: { $gte: new Date(startDate) },
      startDate: { $lte: new Date(startDate) },
      status: true,
    });
    return price;
  },
  // check price route and cartype
  checkPriceRoute: async (routeId, priceHeaderId, carTypeId) => {
    const price = await Price.findOne({
      routeId: routeId,
      priceHeaderId: priceHeaderId,
      carTypeId: carTypeId,
    });
    return price;
  },
};

module.exports = priceService;
