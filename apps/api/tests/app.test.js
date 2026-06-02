const request = require('supertest');
const app = require('../src/app');

describe('StudentOS API', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns project overview with core modules', async () => {
    const response = await request(app).get('/api/v1/catalog/overview');
    expect(response.statusCode).toBe(200);
    expect(response.body.project).toBe('StudentOS');
    expect(response.body.modules).toContain('AI Assistant');
  });

  it('rejects protected route without token', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.statusCode).toBe(401);
  });
});
