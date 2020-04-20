'use strict';

const base64 = require('base-64');
const Users = require('../models/users.js');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send('invalid login');
    return;
  }

  let basic = req.headers.authorization.split(' ').pop();
  let [user, password] = base64.decode(basic).split(':');

  Users.authenticateBasic(user, password)
    .then(async (obj) => {
      req.token = process.env.ONE_TIME_TOKEN
        ? obj.newToken
        : await obj.user.generateToken();
      next();
    })
    .catch((err) => {
      if (err === 'invalid user') {
        res.status(403).send('invalid login');
      } else {
        next(err);
      }
    });
};
