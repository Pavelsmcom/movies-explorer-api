const errorMessages = require('../utils/errors/errors-messages');

module.exports = (err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? errorMessages.server
        : message,
    });
  next();
};
