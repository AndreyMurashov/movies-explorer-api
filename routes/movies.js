const movieRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { body } = require('express-validator');
const movieController = require('../controllers/movies');

const movValid = [
  body('image').isURL(),
  body('trailerLink').isURL(),
  body('thumbnail').isURL(),
];

movieRouter.get('/movies', movieController.getMovies);

movieRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().integer().required(),
    year: Joi.string().required().max(4),
    description: Joi.string().required(),
    image: Joi.string().required(),
    trailerLink: Joi.string().required(),
    thumbnail: Joi.string().required(),
    movieId: Joi.number().integer().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), movValid, movieController.createMovie);

movieRouter.delete('/movies/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
}), movieController.removeMovie);

module.exports = movieRouter;
