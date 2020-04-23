'use strict';

const base64 = require('base-64');
const Users = require('../models/users.js');

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send('invalid login');
    return;
  }

  try {
    const basic = req.headers.authorization.split(' ').pop();
    const [user, password] = base64.decode(basic).split(':');
    const authBasicObj = await Users.authenticateBasic(user, password);

    req.token = authBasicObj.newToken;
    next();
  } catch (err) {
    if (err === 'invalid user') {
      res.status(403).send('invalid login');
    } else {
      next(err);
    }
  }
};
