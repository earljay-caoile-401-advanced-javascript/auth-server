const supergoose = require('@code-fellows/supergoose');
const server = require('../lib/server.js');
const agent = supergoose(server.authServer);
const Users = require('../lib/models/users.js');
const base64 = require('base-64');

console.log = jest.fn();

describe('public page', () => {
  it('can be seen by anyone', async () => {
    const publicRes = await agent.get('/public');
    expect(publicRes.statusCode).toEqual(200);
    expect(publicRes.text).toEqual('public page for anyone');
  });
});

describe('acl guest privileges', () => {
  const guestObj = {
    username: 'john',
    password: 'blue',
    role: 'guest',
  };

  it('will allow a guest to view the private and readonly pages', async () => {
    const user = new Users(guestObj);
    await user.save();

    const autHeader = base64.encode(
      `${guestObj.username}:${guestObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;

    const privateRes = await agent
      .get('/private')
      .set('authorization', `Bearer ${token}`);

    expect(privateRes.statusCode).toEqual(200);
    expect(privateRes.body.message).toEqual(
      `Hi, ${guestObj.username}. Here is the private page!`,
    );

    const readOnlyRes = await agent
      .get('/readonly')
      .set('authorization', `Bearer ${token}`);

    expect(readOnlyRes.statusCode).toEqual(200);
    expect(readOnlyRes.body.message).toEqual(
      `You (${guestObj.username}) can read! Whoo!`,
    );

    const createRes = await agent
      .post('/create')
      .set('authorization', `Bearer ${token}`);

    expect(createRes.statusCode).toEqual(403);
    expect(createRes.text).toEqual('permission denied');
  });
});

describe('acl producer privileges', () => {
  const producerObj = {
    username: 'bob',
    password: 'the_builder',
    role: 'producer',
  };

  it('will allow a producer to only read and create', async () => {
    const user = new Users(producerObj);
    await user.save();

    const autHeader = base64.encode(
      `${producerObj.username}:${producerObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;

    const readOnlyRes = await agent
      .get('/readonly')
      .set('authorization', `Bearer ${token}`);

    expect(readOnlyRes.statusCode).toEqual(200);
    expect(readOnlyRes.body.message).toEqual(
      `You (${producerObj.username}) can read! Whoo!`,
    );

    const createRes = await agent
      .post('/create')
      .set('authorization', `Bearer ${token}`);

    expect(createRes.statusCode).toEqual(200);
    expect(createRes.body.message).toEqual(
      `You (${producerObj.username}) can create! Whoo!`,
    );
  });
});

describe('acl editor privileges', () => {
  const editorObj = {
    username: 'ed',
    password: 'the_editor',
    role: 'editor',
  };

  it('will allow an editor to only read and update', async () => {
    const user = new Users(editorObj);
    await user.save();

    const autHeader = base64.encode(
      `${editorObj.username}:${editorObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;

    const readOnlyRes = await agent
      .get('/readonly')
      .set('authorization', `Bearer ${token}`);

    expect(readOnlyRes.statusCode).toEqual(200);
    expect(readOnlyRes.body.message).toEqual(
      `You (${editorObj.username}) can read! Whoo!`,
    );

    const putRes = await agent
      .put('/update')
      .set('authorization', `Bearer ${token}`);

    expect(putRes.statusCode).toEqual(200);
    expect(putRes.body.message).toEqual(
      `You (${editorObj.username}) can put! Whoo!`,
    );

    const patchRes = await agent
      .patch('/update')
      .set('authorization', `Bearer ${token}`);

    expect(patchRes.statusCode).toEqual(200);
    expect(patchRes.body.message).toEqual(
      `You (${editorObj.username}) can patch! Whoo!`,
    );
  });
});

describe('acl admin privileges', () => {
  const adminObj = {
    username: 'del',
    password: 'the_admin',
    role: 'admin',
  };

  it('will allow an admin to only read and delete', async () => {
    const user = new Users(adminObj);
    await user.save();

    const autHeader = base64.encode(
      `${adminObj.username}:${adminObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;

    const readOnlyRes = await agent
      .get('/readonly')
      .set('authorization', `Bearer ${token}`);

    expect(readOnlyRes.statusCode).toEqual(200);
    expect(readOnlyRes.body.message).toEqual(
      `You (${adminObj.username}) can read! Whoo!`,
    );

    const delRes = await agent
      .delete('/delete')
      .set('authorization', `Bearer ${token}`);

    expect(delRes.statusCode).toEqual(200);
    expect(delRes.body.message).toEqual(
      `You (${adminObj.username}) can delete! Whoo!`,
    );

    const patchRes = await agent
      .patch('/update')
      .set('authorization', `Bearer ${token}`);

    expect(patchRes.statusCode).toEqual(403);
    expect(patchRes.text).toEqual('permission denied');
  });
});

describe('acl godEmperor privileges', () => {
  const superObj = {
    username: 'emperor',
    password: 'da_boss_fo_sho',
    role: 'godEmperor',
  };

  it('will allow a godEmperor to access every route', async () => {
    const user = new Users(superObj);
    await user.save();

    const autHeader = base64.encode(
      `${superObj.username}:${superObj.password}`,
    );

    const signinResponse = await agent
      .post('/signin')
      .set('authorization', `Basic ${autHeader}`);

    const token = signinResponse.text;

    const readOnlyRes = await agent
      .get('/readonly')
      .set('authorization', `Bearer ${token}`);

    expect(readOnlyRes.statusCode).toEqual(200);
    expect(readOnlyRes.body.message).toEqual(
      `You (${superObj.username}) can read! Whoo!`,
    );

    const createRes = await agent
      .post('/create')
      .set('authorization', `Bearer ${token}`);

    expect(createRes.statusCode).toEqual(200);
    expect(createRes.body.message).toEqual(
      `You (${superObj.username}) can create! Whoo!`,
    );

    const delRes = await agent
      .delete('/delete')
      .set('authorization', `Bearer ${token}`);

    expect(delRes.statusCode).toEqual(200);
    expect(delRes.body.message).toEqual(
      `You (${superObj.username}) can delete! Whoo!`,
    );

    const putRes = await agent
      .put('/update')
      .set('authorization', `Bearer ${token}`);

    expect(putRes.statusCode).toEqual(200);
    expect(putRes.body.message).toEqual(
      `You (${superObj.username}) can put! Whoo!`,
    );

    const patchRes = await agent
      .patch('/update')
      .set('authorization', `Bearer ${token}`);

    expect(patchRes.statusCode).toEqual(200);
    expect(patchRes.body.message).toEqual(
      `You (${superObj.username}) can patch! Whoo!`,
    );

    const everyThingRes = await agent
      .get('/everything')
      .set('authorization', `Bearer ${token}`);

    expect(everyThingRes.statusCode).toEqual(200);
    expect(everyThingRes.body.message).toEqual(
      `You (${superObj.username}) can do everything! Mwa ha ha ha!`,
    );
  });
});
