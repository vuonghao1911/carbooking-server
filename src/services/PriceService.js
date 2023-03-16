const Price = require("../modal/Price");
const PriceHeader = require("../modal/PriceHeader");

// car and car type services

const priceService = {
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
  checDatePrice: async (startDate) => {
    const price = await PriceHeader.findOne({
      endDate: { $gte: new Date(startDate) },
      startDate: { $lte: new Date(startDate) },
    });
    return price;
  },
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
