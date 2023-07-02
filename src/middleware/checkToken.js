const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const verifyAccessToken = (req, res, next) => {
  // GET HEADER AUTHORIZATION VALUE
  const headerAuthorization = req.headers.authorization;

  if (!headerAuthorization) {
    return next(createError(401));
  }

  // GET ACCESS TOKEN
  const accessToken = headerAuthorization.split("Bearer")[1]
    ? headerAuthorization.split("Bearer")[1].toString().trim()
    : null;

  if (!accessToken) {
    return next(createError(401));
  }

  // VERIFY ACCESS TOKEN
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, payload) {
      if (err) {
        // EXPIRED ERROR
        if (err.name === "TokenExpiredError") {
          return next(createError(403));
        }

        // OTHER ERROR

        return next(createError(401));
      }

      // VERIFY SUCCESS
      req.user = {
        id: payload.id,
        role: payload.role,
      };
      return next();
    }
  );
};

module.exports = verifyAccessToken;
