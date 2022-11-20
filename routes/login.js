const loginRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userController = require('../controllers/users');

// создание пользователя
loginRouter.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), userController.createUser);

// авторизация пользователя
loginRouter.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), userController.login);

module.exports = loginRouter;
