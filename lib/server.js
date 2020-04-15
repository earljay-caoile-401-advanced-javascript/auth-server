'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/auth-routes.js');
const app = express();

const swaggerGen = require('../docs/swagger.js');
swaggerGen(app);

// 3rd party global middleware
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());

// dummy route to display on homepage
app.get('/', (req, res) => res.send('Server is up! Hooray!'));

app.use(authRoutes);

module.exports = {
  authServer: app,
  start: (port) =>
    app.listen(port, () => console.log(`listening on port ${port}`)),
};
