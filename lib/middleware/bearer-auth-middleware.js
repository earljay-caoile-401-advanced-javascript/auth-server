'use strict';

const Users = require('../models/users.js');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send('invalid login');
    return;
  }

  let token = req.headers.authorization.split(' ').pop();

  Users.authenticateWithToken(token)
    .then(async (obj) => {
      req.user = obj.user;
      req.token = process.env.ONE_TIME_TOKEN
        ? obj.newToken
        : await obj.user.generateToken();
      next();
    })
    .catch((err) => {
      if (err === 'expired token') {
        res.status(403).send('invalid token');
      } else {
        next(err);
      }
    });
};
