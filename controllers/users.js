const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const DefaultError = require('../errors/DefaultError');
const AuthorizationError = require('../errors/AuthorizationError');
const LoginError = require('../errors/LoginError');

// создаёт пользователя
const createUser = (req, res, next) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name: req.body.name,
    }))
    .then((user) => res.send({
      name: user.name,
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new AuthorizationError(`Пользователь с адресом электронной почты ${email} уже существует.`));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }
      return next(err);
    });
};

// авторизация пользователя
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, `${NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key'}`, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => {
      next(new LoginError('Неправильная почта или пароль'));
    });
};

// возвращает текущего пользователя
const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById({ _id })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибочный запрос'));
      } else {
        next(new DefaultError('На сервере произошла ошибка'));
      }
    });
};

// обновляет профиль
const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      name,
      email,
    }, { new: true, runValidators: true }).orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
      .then((user) => {
        res.send(user);
      });
  } catch (err) {
    if (err.code === 11000) {
      next(new AuthorizationError('Ошибка доступа'));
    }
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};

module.exports = {
  createUser,
  updateUser,
  login,
  getCurrentUser,
};
