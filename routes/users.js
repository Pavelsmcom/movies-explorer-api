const usersRoutes = require('express').Router();
const { validateMe } = require('../utils/validation/validation');
const {
  getMe, updateMe,
} = require('../controllers/user');

usersRoutes.get('/me', getMe);
usersRoutes.patch('/me', validateMe, updateMe);

module.exports = usersRoutes;
