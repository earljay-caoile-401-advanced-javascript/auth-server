const supergoose = require('@code-fellows/supergoose');
const server = require('../lib/server.js');
const agent = supergoose(server.authServer);
const Users = require('../lib/models/users.js');
const base64 = require('base-64');

console.log = jest.fn();

describe('basic auth server', () => {
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

  beforeEach(async () => {
    await Users.deleteMany({}).exec();
  });

  it('can allow a new user to sign up', async () => {
    const signupResponse = await agent.post('/signup').send(signinObj);
    expect(signupResponse.statusCode).toBe(200);
    expect(!!signupResponse.text).toBeTruthy();
  });

  it('can allow a new user to sign up with a role with one time token enabled', async () => {
    process.env.ONE_TIME_TOKEN = true;
    const editor = {
      username: 'ed',
      password: 'da_editor',
      role: 'editor',
    };
    const signupResponse = await agent.post('/signup').send(editor);
    expect(signupResponse.statusCode).toBe(200);
    expect(!!signupResponse.text).toBeTruthy();
  });

  it('can prevent users from signing up with an existing username', async () => {
    await agent.post('/signup').send(signinObj);
    const secondSignupRes = await agent.post('/signup').send(signinObj);
    expect(secondSignupRes.statusCode).toBe(403);
    expect(secondSignupRes.text).toBe('You cannot do this!');
  });

  it('can console error for invalid signup', async () => {
    jest.spyOn(global.console, 'error');
    console.error = jest.fn();
    const signupResponse = await agent.post('/signup').send(badObj);
    expect(console.error).toHaveBeenCalled();
    expect(signupResponse.statusCode).toBe(403);
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

  it('will return a 403 error for incorrect login credentials', async () => {
    const user1 = new Users(signinObj);
    await user1.save();

    const realBadAuthHeader = base64.encode(
      `testingbobsaget:wrong-password1234`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${realBadAuthHeader}`);

    expect(signinResponse.statusCode).toBe(403);
    expect(signinResponse.body).toEqual({});

    const wrongPasswordHeader = base64.encode(
      `${signinObj.username}:wrong-password1234-again-555`,
    );

    const signinResponse2 = await agent
      .post('/signin')
      .set('authorization', `Basic ${wrongPasswordHeader}`);
    expect(signinResponse2.statusCode).toBe(403);
    expect(signinResponse2.body).toEqual({});
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

  it('will return a 403 and blank object without authorization headers', async () => {
    const user1 = new Users(signinObj);
    const user2 = new Users(signinObj2);
    await user1.save(signinObj);
    await user2.save(signinObj2);

    const getResponse = await agent.get('/users');
    expect(getResponse.statusCode).toEqual(403);
    expect(getResponse.body).toEqual({});
  });

  it('will properly throw a 500 error and return an error object', async () => {
    const user1 = new Users(signinObj);
    await user1.save(signinObj);

    Users.authenticateBasic = jest.fn(async () => {
      throw new Error('dummy error');
    });

    const autHeader = base64.encode(
      `${signinObj.username}:${signinObj.password}`,
    );

    const getResponse = await agent
      .get('/users')
      .set('authorization', `Basic ${autHeader}`);

    expect(getResponse.statusCode).toEqual(500);
    expect(getResponse.body.text).toBe('Server crashed!');
  });
});
