const request = require('supertest');
const app = require('../src/app');

describe('API baseline', () => {
  it('responds with health data', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('rejects unauthenticated profile access', async () => {
    const response = await request(app).get('/api/users/me');
    expect(response.statusCode).toBe(401);
  });
});
