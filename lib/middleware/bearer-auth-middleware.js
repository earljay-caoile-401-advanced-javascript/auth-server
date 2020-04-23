'use strict';

const Users = require('../models/users.js');

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send('invalid login');
    return;
  }

  try {
    let token = req.headers.authorization.split(' ').pop();
    const authTokenObj = await Users.authenticateWithToken(token);

    req.user = authTokenObj.user;
    req.token = authTokenObj.newToken;
    next();
  } catch (err) {
    if (err === 'expired token') {
      res.status(403).send('invalid token');
    } else {
      next(err);
    }
  }
};
