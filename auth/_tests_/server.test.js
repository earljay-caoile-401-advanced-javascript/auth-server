const supergoose = require('@code-fellows/supergoose');
const server = require('../server.js');
const agent = supergoose(server.authServer);
const Users = require('../models/users.js');
const base64 = require('base-64');

describe('auth server', () => {
  let signinObj;
  let signinObj2;

  beforeEach(async () => {
    signinObj = {
      username: 'john',
      password: 'blue',
    };

    signinObj2 = {
      username: 'bob',
      password: 'saget',
    };
    await Users.deleteMany({}).exec();
  });

  it('can allow a new user to sign up', async () => {
    const signupResponse = await agent.post('/signup').send(signinObj);
    expect(signupResponse.statusCode).toBe(200);
    expect(!!signupResponse.text).toBeTruthy();
  });

  it('can allow an existing user to sign in', async () => {
    const user1 = new Users(signinObj);
    await user1.save();

    const autHeader = base64.encode(
      `${signinObj.username}:${signinObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    expect(signinResponse.statusCode).toBe(200);
    expect(!!signinResponse.text).toBeTruthy();
  });

  it('can return all users', async () => {
    const user1 = new Users(signinObj);
    const user2 = new Users(signinObj2);
    await user1.save(signinObj);
    await user2.save(signinObj2);

    const autHeader = base64.encode(
      `${signinObj.username}:${signinObj.password}`,
    );

    const getResponse = await agent
      .get('/users')
      .set('authorization', `Basic ${autHeader}`);

    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.count).toEqual(2);
    expect(getResponse.body.results[0].username).toEqual('john');
    expect(getResponse.body.results[1].username).toEqual('bob');
  });

  it('will return a blank object without authorization headers', async () => {
    const user1 = new Users(signinObj);
    const user2 = new Users(signinObj2);
    await user1.save(signinObj);
    await user2.save(signinObj2);

    const getResponse = await agent.get('/users');
    expect(getResponse.statusCode).toEqual(403);
    expect(getResponse.body).toEqual({});
  });
});
