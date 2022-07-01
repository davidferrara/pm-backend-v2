/* eslint-disable no-undef */
// const config = require('./utils/config');
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const loginRouter = require('./controllers/login');
const registerRouter = require('./controllers/register');
const usersRouter = require('./controllers/users');
const productsRouter = require('./controllers/products');
const middleware = require('./utils/middleware');
// const logger = require('./utils/logger');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use('/api/login', loginRouter);
// app.use('/api/register', registerRouter);
app.use('/api/users', middleware.userExtractor, usersRouter);
app.use('/api/products', middleware.userExtractor, productsRouter);

// if(process.env.NODE_ENV === 'test') {
//   const testingRouter = require('./controllers/testing');
//   app.use('/api/testing', testingRouter);
// }

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;