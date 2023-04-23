const commonUtils = {
  getPagination: (page, size, total) => {
    const totalPages = Math.ceil(total / size);
    const skip = page * size;
    return {
      skip,
      limit: size,
      totalPages,
    };
  },

  pagination: async (page, size, arr) => {
    const total = arr.length;
    const totalPages = Math.ceil(total / size);
    const skip = page * size;
    const endPossiton = skip + size;
    const arrPagination = arr.slice(skip, endPossiton);

    return {
      arrPagination,
      totalPages,
    };
  },
  totalAmountTicket: async (chair, price, promotion) => {
    var totalAmountDiscount = 0;
    var totalAmount = chair.length * price;
    if (promotion.length > 0 && promotion) {
      for (const elm of promotion) {
        totalAmountDiscount += elm.discountAmount;
      }
    }
    return totalAmount - totalAmountDiscount;
  },
  totalDiscount: async (promotion) => {
    var totalAmountDiscount = 0;

    if (promotion.length > 0 && promotion) {
      for (const elm of promotion) {
        totalAmountDiscount += elm.discountAmount;
      }
    }
    return totalAmountDiscount;
  },
};

module.exports = commonUtils;
