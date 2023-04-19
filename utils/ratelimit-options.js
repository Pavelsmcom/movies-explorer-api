const rateLimit = require('express-rate-limit');

module.exports.limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1  minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'to many request from this IP ',
});
