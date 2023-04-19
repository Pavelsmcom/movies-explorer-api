const moviesRoutes = require('express').Router();
const { validateCreateMovie } = require('../utils/validation/validation');

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movie');

moviesRoutes.get('/', getMovies);
moviesRoutes.post('/', validateCreateMovie, createMovie);
moviesRoutes.delete('/:movieId', deleteMovie);

module.exports = moviesRoutes;
