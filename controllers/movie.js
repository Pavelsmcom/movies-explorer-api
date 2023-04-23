const Movie = require('../models/movie');

const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const ForbiddenError = require('../utils/errors/forbidden-error');
const errorMessages = require('../utils/errors/errors-messages');

const responseMessages = require('../utils/response-messages');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError(errorMessages.badRequest));
        return;
      }
      next(error);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;

  Movie.findById(movieId)
    .orFail()
    .then((movie) => {
      if (movie.owner.toString() !== _id) {
        next(new ForbiddenError(errorMessages.forbidden));
      } else {
        Movie.findByIdAndDelete(movieId)
          .then(() => {
            res.send({ message: responseMessages.movieDelete });
          })
          .catch(next);
      }
    })
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
