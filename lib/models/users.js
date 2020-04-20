'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let secret = 'thisisauthserverlabbbq';

const Users = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  currentIat: { type: Number },
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
      return this.outputObjHelper(user);
    } else {
      throw 'invalid user';
    }
  } else {
    throw 'invalid user';
  }
};

Users.statics.authenticateWithToken = async function (token) {
  try {
    let tokenObject = jwt.verify(token, secret);
    // console.log(tokenObject);
    if (process.env.TIME_SENSITIVE) {
      const timeDiff = parseInt(Date.now()) - parseInt(tokenObject.iat * 1000);
      // console.log('What is timeDiff?', timeDiff);

      if (timeDiff > 900000) {
        throw new Error('expired token');
      }
    }

    let user = await this.findOne({ username: tokenObject.username });

    if (
      process.env.ONE_TIME_TOKEN &&
      parseInt(tokenObject.iat) !== parseInt(user.currentIat)
    ) {
      throw new Error('expired token');
    }

    return this.outputObjHelper(user);
  } catch (e) {
    throw e.message;
  }
};

Users.statics.outputObjHelper = async function (user) {
  const obj = { user };

  if (process.env.ONE_TIME_TOKEN) {
    const newToken = user.generateToken();
    const newTokenObj = jwt.verify(newToken, secret);
    obj.newToken = newToken;
    user.currentIat = newTokenObj.iat;
    await this.findByIdAndUpdate(user._id, user, { new: true });
  }

  return obj;
};

// anything.methods.whatever === instance method
Users.methods.generateToken = function () {
  // Use the user stuff (this) to make a token.
  let userObject = {
    username: this.username,
  };

  if (process.env.TIME_SENSITIVE) {
    console.log('Tokens are time sensitive and expire after 15 minutes!');
  }

  if (process.env.ONE_TIME_TOKEN) {
    console.log('Tokens can only be used once!');
  }

  return jwt.sign(userObject, secret);
};

module.exports = mongoose.model('users', Users);
