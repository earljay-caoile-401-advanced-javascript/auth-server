'use strict';

const fourOhFour = require('../lib/middleware/404');
const fiveHundred = require('../lib/middleware/error-handler.js');

const req = {};

console.log = jest.fn();

const res404 = {
  send: function (msg) {
    expect(msg).toEqual('route not supported');
  },
  status: function (num) {
    expect(num).toEqual(404);
    // Calling this to be chainable
    return this;
  },
};

const fakeErrorMsg = 'fake error';
const res500 = {
  json: function (error) {
    expect(error.text).toEqual('Server crashed!');
    expect(error.error).toEqual(fakeErrorMsg);
  },
  status: function (num) {
    expect(num).toEqual(500);
    // Calling this to be chainable
    return this;
  },
};

const next = jest.fn();
jest.spyOn(global.console, 'log');

describe('404 middleware', () => {
  it('works', () => {
    fourOhFour(req, res404, next);
  });
});

describe('error handler middleware', () => {
  it('works', () => {
    fiveHundred(fakeErrorMsg, req, res500, next);
  });
});
