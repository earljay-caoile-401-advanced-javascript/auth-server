'use strict';

const express = require('express');
const basicAuth = require('./middleware/basic-auth-middleware.js');
const signupRoute = require('./routes/signup.js');
const signinRoute = require('./routes/signin.js');
const getUsersRoute = require('./routes/getUsers.js');

const app = express();

app.use(express.json());

// echo '{"username":"john", "password":"blue"}' | http post :3000/signup
app.post('/signup', signupRoute);

// http post :3000/signin -a john:hasadog
app.post('/signin', basicAuth, signinRoute);

app.get('/users', basicAuth, getUsersRoute);

module.exports = {
  authServer: app,
  start: (port) =>
    app.listen(port, () => console.log(`listening on port ${port}`)),
};
