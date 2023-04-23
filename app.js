require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const { errors } = require('celebrate');
const cors = require('cors');

const routes = require('./routes/index');

// const { corsOptions } = require('./utils/cors-options'); // добавлю после деплоя фронтенда
const { limiter } = require('./utils/ratelimit-options');

const errorMiddleware = require('./middlewares/error-middleware');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, DB_SERVER = '127.0.0.1:27017/newTest' } = process.env;

const app = express();

app.use(cors());
app.use(helmet());

app.use(bodyParser.json());
app.use(requestLogger);
app.use(limiter);

app.use(routes);

app.use(errorLogger);
app.use(errors());
app.use(errorMiddleware);

mongoose
  .connect(`mongodb://${DB_SERVER}`)
  .then(() => {
    console.log('Connect to DataBase');
  })
  .catch((error) => {
    console.log(`Error DataBase ${error}`);
  });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
