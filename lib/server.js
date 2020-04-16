'use strict';

const express = require('express');
const authRoutes = require('./routes/auth-routes.js');
const app = express();

const notFoundHandler = require('./middleware/404.js');
const errorHandler = require('./middleware/error-handler.js');
const swaggerGen = require('../docs/swagger.js');

swaggerGen(app);

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
