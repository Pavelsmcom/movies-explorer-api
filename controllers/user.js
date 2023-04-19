require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const ConflictError = require('../utils/errors/conflict-error');

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
        next(new ConflictError('A user already exists'));
        return;
      }
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Bad Request'));
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
        next(new BadRequestError('Bad Request'));
        return;
      }
      if (error.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Not Found'));
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
          next(new BadRequestError('Bad Request'));
          break;

        case 'CastError':
          next(new BadRequestError('Bad Request'));
          break;

        case 'MongoServerError':
          next(new BadRequestError('Bad Request'));
          break;

        case 'DocumentNotFoundError':
          next(new NotFoundError('Not Found'));
          break;

        default:
          next(error);
      }
    });
};
