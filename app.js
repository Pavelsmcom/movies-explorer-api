require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const { errors } = require('celebrate');
const cors = require('cors');

const routes = require('./routes/index');

const { corsOptions } = require('./utils/cors-options');
const { limiter } = require('./utils/ratelimit-options');

const errorMiddleware = require('./middlewares/error-middleware');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, DB_SERVER } = process.env;

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
    // eslint-disable-next-line no-console
    console.log('Connect to DataBase');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log(`Error DataBase ${error}`);
  });

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
