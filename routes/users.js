const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userController = require('../controllers/users');

// возвращает информацию о пользователе (email и имя)
userRouter.get('/users/me', userController.getCurrentUser);

// обновляет информацию о пользователе (email и имя)
userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }),
}), userController.updateUser);

module.exports = userRouter;
