require('dotenv').config();
const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../utils/errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Required authorization'));
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new UnauthorizedError('Required authorization'));
    return;
  }
  // eslint-disable-next-line max-len
  req.user = payload; // записываем пейлоуд в объект запроса, чтобы  следующий мидлвэр мог определить авторизованного пользователя
  next();
};
