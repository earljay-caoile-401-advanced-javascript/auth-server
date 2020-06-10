const supergoose = require('@code-fellows/supergoose');
const server = require('../lib/server.js');
const agent = supergoose(server.authServer);
const Users = require('../lib/models/users.js');
const base64 = require('base-64');

console.log = jest.fn();

describe('bearer auth', () => {
  const signinObj = {
    username: 'john',
    password: 'blue',
    role: 'guest',
  };

  const oldToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJpYXQiOjE1ODczNDQxMjN9.EL2i0fDBdh0jPxJYMucI2fk2o9-YepMHeybnFTpZ1x8';

  beforeAll(async () => {
    const user1 = new Users(signinObj);
    await user1.save();
  });

  afterAll(async () => {
    await Users.deleteMany({}).exec();
  });

  it('can access the secret route', async () => {
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
    const expectedMsg = `You have access to dirty secrets, ${signinObj.username}. Welcome!`;

    expect(secretResponse.statusCode).toBe(200);
    expect(secretResponse.body.message).toBe(expectedMsg);
  });

  it('will return a 403 and blank object without authorization headers', async () => {
    const secretResponse = await agent.get('/secret');
    expect(secretResponse.statusCode).toEqual(403);
    expect(secretResponse.body).toEqual({});
  });

  it('will return a 403 for an expired time sensitive token', async () => {
    process.env.TIME_SENSITIVE = true;
    jest.spyOn(global.console, 'error');

    const secretResponse = await agent
      .get('/secret')
      .set('authorization', `Bearer ${oldToken}`);
    expect(secretResponse.statusCode).toEqual(403);
  });

  it('will allow a token to be used only once when one-use tokens are enabled', async () => {
    process.env.ONE_TIME_TOKEN = true;

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
    expect(secretResponse.statusCode).toBe(200);

    const secondSecretRes = await agent
      .get('/secret')
      .set('authorization', `Bearer ${token}`);

    expect(secondSecretRes.statusCode).toBe(403);
    expect(secondSecretRes.text).toBe('invalid token');
  });

  it('will properly throw a 500 error and return an error object', async () => {
    const secretResponse = await agent
      .get('/secret')
      .set('authorization', 'blahblah fakeauthorzation555!!!!!!!!!!');

    expect(secretResponse.statusCode).toEqual(500);
    expect(secretResponse.body.text).toBe('Server crashed!');
    expect(secretResponse.body.error).toBe('jwt malformed');
  });
});
