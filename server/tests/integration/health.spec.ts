import request from 'supertest';
import app from '../../src/index';

describe('GET /health', () => {
  it('returns backend status and timestamp', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('active');
    expect(typeof response.body.timestamp).toBe('string');
  });
});
