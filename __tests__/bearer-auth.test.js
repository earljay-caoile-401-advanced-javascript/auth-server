const supergoose = require('@code-fellows/supergoose');
const server = require('../lib/server.js');
const agent = supergoose(server.authServer);
const Users = require('../lib/models/users.js');
const base64 = require('base-64');

describe('auth server', () => {
  const signinObj = {
    username: 'john',
    password: 'blue',
  };

  const signinObj2 = {
    username: 'bob',
    password: 'saget',
  };

  const badObj = {
    notUsername: false,
    password: 1.523,
    someOtherProp: 'lulz',
  };

  const oldToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJpYXQiOjE1ODczNDQxMjN9.EL2i0fDBdh0jPxJYMucI2fk2o9-YepMHeybnFTpZ1x8';

  afterEach(async () => {
    await Users.deleteMany({}).exec();
  });

  it('can access the secret route', async () => {
    const user1 = new Users(signinObj);
    await user1.save();

    const autHeader = base64.encode(
      `${signinObj.username}:${signinObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;
    console.log(token);
    const secretResponse = await agent
      .get('/secret')
      .set('authorization', `Bearer ${token}`);
    const expectedMsg = `You have access to dirty secrets, ${signinObj.username}. Welcome!`;

    expect(secretResponse.statusCode).toBe(200);
    expect(secretResponse.body.message).toBe(expectedMsg);
  });

  it('will return a 403 and blank object without authorization headers', async () => {
    const user1 = new Users(signinObj);
    const user2 = new Users(signinObj2);
    await user1.save(signinObj);
    await user2.save(signinObj2);

    const secretResponse = await agent.get('/secret');
    expect(secretResponse.statusCode).toEqual(403);
    expect(secretResponse.body).toEqual({});
  });

  it('will return a 403 for an expired time sensitive token', async () => {
    process.env.TIME_SENSITIVE = true;
    jest.spyOn(global.console, 'error');

    const user1 = new Users(signinObj);
    await user1.save(signinObj);

    const secretResponse = await agent
      .get('/secret')
      .set('authorization', `Bearer ${oldToken}`);
    expect(secretResponse.statusCode).toEqual(403);
  });

  it('will return a 500 for a dummy error', async () => {
    Users.authenticateWithToken = jest.fn(async () => {
      throw 'dummy error';
    });

    const autHeader = base64.encode(
      `${signinObj.username}:${signinObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;

    const secretResponse = await agent
      .get('/secret')
      .set('authorization', `Bearer ${token}`);

    expect(secretResponse.statusCode).toEqual(500);
    expect(secretResponse.body.text).toBe('Server crashed!');
    expect(secretResponse.body.error).toBe('dummy error');
  });
});
