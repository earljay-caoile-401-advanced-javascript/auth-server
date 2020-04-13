'use strict';

const Users = require('../models/users.js');

module.exports = async (req, res) => {
  let user = new Users(req.body);
  user
    .save(req.body)
    .then((user) => {
      // make a token
      let token = user.generateToken(user);
      res.status(200).send(token);
    })
    .catch((err) => {
      console.error(err);
      res.status(403).send('You cannot do this');
    });
};
