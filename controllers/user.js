require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const ConflictError = require('../utils/errors/conflict-error');
const errorMessages = require('../utils/errors/errors-messages');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => {
      res.send(user.toJSON());
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictError(errorMessages.conflict));
        return;
      }
      if (error.name === 'ValidationError') {
        next(new BadRequestError(errorMessages.badRequest));
        return;
      }
      next(error);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports.getMe = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail()
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError(errorMessages.badRequest));
        return;
      }
      if (error.name === 'DocumentNotFoundError') {
        next(new NotFoundError(errorMessages.notFound));
        return;
      }
      next(error);
    });
};

module.exports.updateMe = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      switch (error.name) {
        case 'ValidationError':
          next(new BadRequestError(errorMessages.badRequest));
          break;

        case 'CastError':
          next(new BadRequestError(errorMessages.badRequest));
          break;

        case 'MongoServerError':
          next(new ConflictError(errorMessages.conflict));
          break;

        case 'DocumentNotFoundError':
          next(new NotFoundError(errorMessages.notFound));
          break;

        default:
          next(error);
      }
    });
};
