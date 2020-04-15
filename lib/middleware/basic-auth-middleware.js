'use strict';

const base64 = require('base-64');
const Users = require('../models/users.js');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send('invalid login');
    next('invalid login');
    return;
  }

  let basic = req.headers.authorization.split(' ').pop();
  let [user, password] = base64.decode(basic).split(':');

  Users.authenticateBasic(user, password)
    .then((validUser) => {
      req.token = validUser.generateToken();
      next();
    })
    .catch((err) => {
      res.status(403).send('invalid login');
      next(`Invalid login! ${err}`);
    });
};
