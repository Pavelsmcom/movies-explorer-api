const rateLimit = require('express-rate-limit');
const errorMessages = require('./errors/errors-messages');

module.exports.limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1  minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: errorMessages.manyRequest,
});
