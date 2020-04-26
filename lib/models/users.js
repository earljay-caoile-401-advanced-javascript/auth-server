'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const acl = require('./acl.js');

let secret = 'thisisauthserverlabbbq';

const Users = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: 'guest',
    enum: ['admin', 'editor', 'producer', 'guest', 'godEmperor'],
  },
  currentToken: { type: String },
});

// mongo pre-save
Users.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

/**
 * static function that returns an object to use as output
 * @param {string} username - string of the username entered by the user
 * @param {string} res - response object used to send the status code in case of an invalid model
 * @returns {object} - object containing a user and a new token
 */
Users.statics.authenticateBasic = async function (username, password) {
  let query = { username };
  let user = await this.findOne(query);

  if (user) {
    let isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      return await this.outputObjHelper(user);
    } else {
      throw 'invalid user';
    }
  } else {
    throw 'invalid user';
  }
};

/**
 * static function that returns an object to use as output
 * @param {string} token - string of the token entered by the user
 * @returns {object} - object containing a user and a new token
 * @returns {Error} - expired token
 * @returns {Error} default - unexpected error
 */
Users.statics.authenticateWithToken = async function (token) {
  try {
    let tokenObject = jwt.verify(token, secret);

    if (process.env.TIME_SENSITIVE) {
      const timeDiff = parseInt(Date.now()) - parseInt(tokenObject.iat * 1000);

      if (timeDiff > 900000) {
        throw new Error('expired token');
      }
    }

    let user = await this.findOne({ username: tokenObject.username });

    if (process.env.ONE_TIME_TOKEN && tokenObject.hash !== user.currentToken) {
      throw new Error('expired token');
    }

    return this.outputObjHelper(user);
  } catch (e) {
    throw e.message;
  }
};

/**
 * helper function that helps provide the object as output for other functions
 * @param {object} user - user object to include in the output object
 * @returns {object} - object containing a user and a new token
 * @returns {Error} default - unexpected error
 */
Users.statics.outputObjHelper = async function (user) {
  const obj = { user };
  const newToken = await user.generateToken();
  obj.newToken = newToken;

  if (process.env.ONE_TIME_TOKEN) {
    const newTokenObj = jwt.verify(newToken, secret);
    user.currentToken = newTokenObj.hash;

    await this.findByIdAndUpdate(user._id, user, {
      new: true,
      useFindAndModify: false,
    });
  }

  return obj;
};

/**
 * instance method that generates a sign jwt token and returns it
 * @returns {string} - jwt token
 * @returns {Error} default - unexpected error
 */
Users.methods.generateToken = async function () {
  let userObject = {
    username: this.username,
  };

  if (process.env.TIME_SENSITIVE) {
    console.log('Tokens are time sensitive and expire after 15 minutes!');
  }

  if (process.env.ONE_TIME_TOKEN) {
    console.log('Tokens can only be used once!');
    userObject.hash = await bcrypt.hash(Date.now().toString(), 5);
  }

  return jwt.sign(userObject, secret);
};

Users.methods.can = function (task) {
  return acl[this.role].includes(task);
};

module.exports = mongoose.model('users', Users);
