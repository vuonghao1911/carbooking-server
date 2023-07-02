const handleEror = (err, req, res, next) => {
  const { stack, status = 400, message } = err;

  if (stack) {
    return res.status(status).json({ status, message });
  }
  next();
};

module.exports = handleEror;
