'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const notFoundHandler = require('./middleware/404');
const errorHandler = require('./middleware/error-handler.js');
const authRoutes = require('./routes/auth-routes.js');
const swaggerGen = require('../docs/swagger.js');

const app = express();
swaggerGen(app);

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());

app.get('/', (req, res) => res.send('Server is up! Hooray!'));

app.use(authRoutes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = {
  authServer: app,
  start: (port) =>
    app.listen(port, () => console.log(`listening on port ${port}`)),
};
