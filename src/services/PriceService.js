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

  getAllPriceHeader: async () => {
    const price = await PriceHeader.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "userUpdate",
          foreignField: "_id",
          as: "employeesUpdate",
        },
      },
      {
        $unwind: "$employeesUpdate",
      },
      {
        $lookup: {
          from: "employees",
          localField: "userCreate",
          foreignField: "_id",
          as: "employeesCreate",
        },
      },
      {
        $unwind: "$employeesCreate",
      },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          startDate: "$startDate",
          endDate: "$endDate",
          status: "$status",
          code: "$code",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          user: {
            userUpDate: "$employeesUpdate",
            userCreate: "$employeesCreate",
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return price;
  },
  getPriceHeaderByCode: async (code) => {
    const price = await PriceHeader.aggregate([
      {
        $match: {
          code: code,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "userUpdate",
          foreignField: "_id",
          as: "employeesUpdate",
        },
      },
      {
        $unwind: "$employeesUpdate",
      },
      {
        $lookup: {
          from: "employees",
          localField: "userCreate",
          foreignField: "_id",
          as: "employeesCreate",
        },
      },
      {
        $unwind: "$employeesCreate",
      },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          startDate: "$startDate",
          endDate: "$endDate",
          status: "$status",
          code: "$code",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          user: {
            userUpDate: "$employeesUpdate",
            userCreate: "$employeesCreate",
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return price;
  },
};

module.exports = priceService;
