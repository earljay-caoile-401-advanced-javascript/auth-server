require('@code-fellows/supergoose');
const server = require('../lib/server.js');

describe('server start', () => {
  it('will console log on start', () => {
    console.log = jest.fn();
    jest.spyOn(global.console, 'log');
    server.authServer.listen = jest.fn((port) => {
      console.log('running on', port);
    });
    server.start(3000);
    expect(console.log).toHaveBeenCalled();
  });
});
