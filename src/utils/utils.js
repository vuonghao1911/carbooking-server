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
};

module.exports = commonUtils;
