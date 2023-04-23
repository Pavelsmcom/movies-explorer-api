const router = require('express').Router();
const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const auth = require('../middlewares/auth');
const { login, createUser } = require('../controllers/user');
const { validateSignIn, validateSignUp } = require('../utils/validation/validation');

const NotFoundError = require('../utils/errors/not-found-error');
const errorMessages = require('../utils/errors/errors-messages');

router.post('/signin', validateSignIn, login);
router.post('/signup', validateSignUp, createUser);

router.use('/movies', auth, moviesRoutes);
router.use('/users', auth, usersRoutes);
router.use('/*', auth, (req, res, next) => {
  next(new NotFoundError(errorMessages.notFound));
});

module.exports = router;
