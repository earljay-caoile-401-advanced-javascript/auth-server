'use strict';

const express = require('express');
const router = express.Router();
const bearerAuth = require('../middleware/bearer-auth-middleware.js');
const aclCheck = require('../middleware/acl-middleware.js');

/**
 * secret route that checks for bearer authorization and then returns a confirmation message
 * @route GET /secret
 * @returns {secret.model} 200 - An object with a confirmation message and a token
 * @returns {Error} 403 - invalid login
 * @returns {Error} 500 - unexpected error
 */
router.get('/secret', bearerAuth, (req, res) => {
  const output = {
    message: `You have access to dirty secrets, ${req.user.username}. Welcome!`,
  };

  if (process.env.ONE_TIME_TOKEN) {
    output.token = req.token;
  }

  res.status(200).json(output);
});

router.get('/public', (req, res) => {
  res.send('public page for anyone');
});

router.get('/secret', bearerAuth, (req, res) => {
  res.status(200).send(`You have access to the secret route. Shhh!`);
});

router.get('/private', bearerAuth, (req, res) => {
  res.send(`Hi, ${req.user.username}. Here is the private page!`);
});

router.get('/readonly', bearerAuth, aclCheck('read'), (req, res) => {
  res.send(`You (${req.user.username}) can read! Whoo!`);
});

router.post('/create', bearerAuth, aclCheck('create'), (req, res) => {
  res.send(`You (${req.user.username}) can create! Whoo!`);
});

router.put('/update', bearerAuth, aclCheck('update'), (req, res) => {
  res.send(`You (${req.user.username}) can put! Whoo!`);
});

router.patch('/update', bearerAuth, aclCheck('update'), (req, res) => {
  res.send(`You (${req.user.username}) can patch! Whoo!`);
});

router.delete('/delete', bearerAuth, aclCheck('delete'), (req, res) => {
  res.send(`You (${req.user.username}) can delete! Bye-bye!`);
});

router.get('/everything', bearerAuth, aclCheck('superuser'), (req, res) => {
  res.send(`You (${req.user.username}) can do everything! Mwa ha ha ha!`);
});

module.exports = router;
