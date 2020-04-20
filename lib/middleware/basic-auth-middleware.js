'use strict';

const base64 = require('base-64');
const Users = require('../models/users.js');

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send('invalid login');
    return;
  }

  try {
    let basic = req.headers.authorization.split(' ').pop();
    let [user, password] = base64.decode(basic).split(':');

    const authBasicObj = await Users.authenticateBasic(user, password);
    req.token = process.env.ONE_TIME_TOKEN
      ? authBasicObj.newToken
      : await authBasicObj.user.generateToken();
    next();
  } catch (err) {
    if (err === 'invalid user') {
      res.status(403).send('invalid login');
    } else {
      next(err);
    }
  }
};
