const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const UnauthorizedError = require('../utils/errors/unauthorized-error');
const errorMessages = require('../utils/errors/errors-messages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: errorMessages.invalidEmail,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError(errorMessages.usernameOrPassword));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError(errorMessages.usernameOrPassword));
          }
          return user;
        });
    });
};

userSchema.methods.toJSON = function () {
  const data = this.toObject();

  delete data.password;
  delete data.__v;
  return data;
};

module.exports = mongoose.model('user', userSchema);
