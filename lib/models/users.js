'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let secret = 'thisisauthserverlabbbq';

const Users = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// mongo pre-save
Users.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

// anything.statics.whatever === static or class method
Users.statics.authenticateBasic = async function (username, password) {
  let query = { username };
  let user = await this.findOne(query);
  if (user) {
    let isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      return user;
    } else {
      throw 'Invalid User';
    }
  } else {
    throw 'Invalid User';
  }
};

Users.statics.authenticateWithToken = async function (token) {
  try {
    let tokenObject = jwt.verify(token, secret);

    if (process.env.TIME_SENSITIVE) {
      const timeDiff = parseInt(Date.now()) - parseInt(tokenObject.tokenTime);

      if (!tokenObject.tokenTime || timeDiff > 900000) {
        throw new Error('expired token');
      }
    }

    let user = await this.findOne({ username: tokenObject.username });
    return user;
  } catch (e) {
    throw e.message;
  }
};

// anything.methods.whatever === instance method
Users.methods.generateToken = function () {
  // Use the user stuff (this) to make a token.
  let userObject = {
    username: this.username,
  };

  if (process.env.TIME_SENSITIVE) {
    console.log('adding timestamp prop');
    userObject.tokenTime = Date.now();
  }

  return jwt.sign(userObject, secret);
};

module.exports = mongoose.model('users', Users);
