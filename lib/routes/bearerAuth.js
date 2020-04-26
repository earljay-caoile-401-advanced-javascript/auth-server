'use strict';

const express = require('express');
const router = express.Router();
const bearerAuth = require('../middleware/bearer-auth-middleware.js');
const aclCheck = require('../middleware/acl-middleware.js');

router.get('/public', (req, res) => {
  res.send('public page for anyone');
});

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
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token to access
 * @route GET /private
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.get('/private', bearerAuth, (req, res) => {
  const output = {
    message: `Hi, ${req.user.username}. Here is the private page!`,
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token and read access
 * @route GET /readonly
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.get('/readonly', bearerAuth, aclCheck('read'), (req, res) => {
  const output = {
    message: `You (${req.user.username}) can read! Whoo!`,
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token and create access
 * @route POST /create
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.post('/create', bearerAuth, aclCheck('create'), (req, res) => {
  const output = {
    message: `You (${req.user.username}) can create! Whoo!`,
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token and update access
 * @route PUT /update
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.put('/update', bearerAuth, aclCheck('update'), (req, res) => {
  const output = {
    message: `You (${req.user.username}) can put! Whoo!`,
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token and update access
 * @route PATCH /update
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.patch('/update', bearerAuth, aclCheck('update'), (req, res) => {
  const output = {
    message: `You (${req.user.username}) can patch! Whoo!`,
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token and delete access
 * @route DELETE /delete
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.delete('/delete', bearerAuth, aclCheck('delete'), (req, res) => {
  const output = {
    message: `You (${req.user.username}) can delete! Whoo!`,
    token: req.token,
  };

  res.status(200).json(output);
});

/**
 * route that requires a valid bearer auth token and delete access
 * @route GET /everything
 * @returns {object} 200 - an object containing a confirmation message and a token if one use tokens are enabled
 * @returns {Error} 403 - invalid login or unauthorized
 * @returns {Error} 500 - unexpected error
 */
router.get('/everything', bearerAuth, aclCheck('superuser'), (req, res) => {
  const output = {
    message: `You (${req.user.username}) can do everything! Mwa ha ha ha!`,
    token: req.token,
  };

  res.status(200).json(output);
});

module.exports = router;
