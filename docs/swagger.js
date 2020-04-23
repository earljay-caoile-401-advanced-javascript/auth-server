'use strict';

/**
 * loads express-swagger-generator with the appropriate options to generate a Swagger page for the API server
 * @param {object} app - express app instance
 * @returns (void)
 */
module.exports = (app) => {
  const expressSwagger = require('express-swagger-generator')(app);
  const sampleData = require('../data/db.json');

  const options = {
    swaggerDefinition: {
      info: {
        description: 'This is a sample server',
        title: 'Swagger',
        version: '1.0.0',
      },
      host: process.env.HOST || 'localhost:3000', // damage control in case user doesn't fill out .env
      basePath: '/',
      produces: ['application/json', 'application/xml'],
      schemes:
        !process.env.HOST || process.env.HOST.includes('localhost')
          ? ['http']
          : ['https'],
      securityDefinitions: {
        basicAuth: {
          type: 'basic',
        },
        JWT: {
          type: 'apiKey',
          in: 'header',
          name: 'authorization',
          description: 'a basic authentication encoded string',
        },
      },
      security: [{ basicAuth: [], JWT: [] }],
      definitions: {
        user_request: {
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
          example: {
            username: sampleData.users[0].username,
            password: 'expletives555',
          },
          required: ['username', 'password'],
        },
        token: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNTg2OTI0Nzg5fQ.d0xwMx3vwLqw_Z2Skoy5Wmpzv26CNkAwGl-tm4bazg8',
        },
        user_response: {
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            password: { type: 'string' },
            __v: { type: 'number' },
          },
          required: ['id', 'username', 'password'],
        },
        users: {
          properties: {
            count: { type: 'number' },
            results: {
              type: 'array',
              items: {
                $ref: '#/definitions/user_response',
              },
            },
          },
          example: {
            count: sampleData.users.length,
            results: sampleData.users,
          },
          required: ['count', 'results'],
        },
      },
    },
    basedir: __dirname, //app absolute path
    files: ['../lib/routes/***.js'], //Path to the API handle folder
  };
  expressSwagger(options);
};
