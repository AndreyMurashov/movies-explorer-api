const Movie = require('../models/movie');
const DefaultError = require('../errors/DefaultError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

// возвращает все фильмы
module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((films) => {
      res.status(200).json(films);
    })
    .catch((err) => {
      next(new DefaultError('На сервере произошла ошибка'));
    });
};

// создаёт фильм
module.exports.createMovie = async (req, res, next) => {
  try {
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
    const owner = req.user._id;
    const data = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      nameRU,
      nameEN,
      owner,
      movieId,
    });
    res.status(200).json(data);
  } catch (e) {
    if (e.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании карточки фильма'));
    } else {
      next(new DefaultError('Ошибка по умолчанию'));
    }
  }
};

// // удаляет фильм
module.exports.removeMovie = (req, res, next) => {
  Movie.findById(req.params._id).orFail(() => {})
    .then((film) => {
      if (!film) {
        return next(new NotFoundError('Запрашиваемый ресурс не найден'));
      }
      if (req.user._id === film.owner.toString()) {
        return Movie.deleteOne(film)
          .then(() => {
            res.status(200).send({ message: 'Карточка фильма удалена' });
          });
      }
      next(new ForbiddenError('Нельзя удалять чужие карточки'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Фильм с указанным _id не найден'));
      } else {
        next(new DefaultError('На сервере произошла ошибка'));
      }
    });
};
