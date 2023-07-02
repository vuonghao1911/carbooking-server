const jwt = require("jsonwebtoken");

const JwtService = {
  signAccessTokenService: async (payload) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1h",
    };
    const token = await jwt.sign(payload, secret, options);
    return token;
  },
  signRefreshTokenService: async (payload) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "7d",
    };
    const token = await jwt.sign(payload, secret, options);
    return token;
  },

  verifyRefreshToken: async (refreshToken) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;

    const token = await jwt.verify(refreshToken, secret);

    return token;
  },
};

module.exports = JwtService;
