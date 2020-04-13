'use strict';

const Users = require('../models/users.js');

module.exports = (req, res) => {
  Users.find({}).then((results) => {
    let output = {
      count: results.length,
      results,
    };
    res.status(200).json(output);
  });
};
