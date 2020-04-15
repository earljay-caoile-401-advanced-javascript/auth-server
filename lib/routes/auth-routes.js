'use strict';

const express = require('express');
const router = express.Router();
const Users = require('../models/users.js');

const basicAuth = require('../middleware/basic-auth-middleware.js');

router.post('/signup', (req, res) => {
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
});

// http post :3000/signin -a john:hasadog
router.post('/signin', basicAuth, (req, res) => {
  res.status(200).send(req.token);
});

/**
 * fetches an array of user objects along with the count of objects
 * @route GET /users
 * @returns {users.model} 200 - An object containing an array of products and the array count
 * @returns {Error} 403 - invalid login
 * @returns {Error} 500 - Unexpected error
 */
router.get('/users', basicAuth, (req, res) => {
  Users.find({}).then((results) => {
    let output = {
      count: results.length,
      results,
    };
    res.status(200).json(output);
  });
});

module.exports = router;
