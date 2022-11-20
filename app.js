require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const auth = require('./middlewares/auth');
const mainErrors = require('./middlewares/mainErrors');

// const userRouter = require('./routes/users');
// const { login, createUser } = require('./controllers/users');
// const movieRouter = require('./routes/movies');
const NotFoundError = require('./errors/NotFoundError');
const cors = require('./middlewares/cors');
const limiter = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const { PORT = 3000, DB_ADDRESS = 'mongodb://localhost:27017/bitfilmsdb' } = process.env;

const absentisPage = (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
};

app.use(express.json());
app.use(cors);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.use(helmet());
app.use(requestLogger);
app.use(limiter);

app.use(require('./routes/login'));

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.all('*', absentisPage);

app.use(errorLogger);

app.use(errors());
app.use(mainErrors);

mongoose
  .connect(DB_ADDRESS, {
    useNewUrlParser: true,
  });

app.listen(PORT);
