const Movie = require('../models/movie');

const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const ForbiddenError = require('../utils/errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    // eslint-disable-next-line max-len
    country, director, duration, year, description, image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;

  Movie.create({
    // eslint-disable-next-line max-len
    country, director, duration, year, description, image, trailerLink, thumbnail, movieId, nameRU, nameEN, owner: req.user._id,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Bad Request'));
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
        next(new ForbiddenError('Can`t delete others movies'));
      } else {
        Movie.findByIdAndDelete(movieId)
          .then(() => {
            res.send({ message: 'Movie delete' });
          });
      }
    })
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
