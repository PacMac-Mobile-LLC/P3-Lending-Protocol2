import request from 'supertest';
import app from '../../src/index';
import { TrustService } from '../../src/services/trustService';

const VALID_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/users/:user_id/trust', () => {
  it('returns 400 for invalid UUID format', async () => {
    const response = await request(app)
      .get('/api/users/not-a-uuid/trust')
      .set('x-test-user-id', VALID_USER_ID);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/Invalid User ID format/i);
  });

  it('returns 404 when no snapshot exists', async () => {
    vi.spyOn(TrustService, 'getLatestTrustSnapshot').mockResolvedValueOnce(null as any);

    const response = await request(app)
      .get(`/api/users/${VALID_USER_ID}/trust`)
      .set('x-test-user-id', VALID_USER_ID);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/No trust score snapshot found/i);
  });

  it('returns latest trust snapshot for valid user id', async () => {
    vi.spyOn(TrustService, 'getLatestTrustSnapshot').mockResolvedValueOnce({
      score: 82,
      risk_tier: 2,
      snapshot_time: '2026-02-16T00:00:00.000Z',
      model_version: 'p3-alpha-v1',
      feature_vector_hash: '0xabc123',
    } as any);

    const response = await request(app)
      .get(`/api/users/${VALID_USER_ID}/trust`)
      .set('x-test-user-id', VALID_USER_ID);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      trust_score: 82,
      risk_tier: 2,
      snapshot_time: '2026-02-16T00:00:00.000Z',
      model_version: 'p3-alpha-v1',
      feature_vector_hash: '0xabc123',
    });
  });

  it('returns 401 when auth context is missing', async () => {
    const response = await request(app).get(`/api/users/${VALID_USER_ID}/trust`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/Missing bearer token/i);
  });

  it('returns 403 when requesting another user snapshot without privileged role', async () => {
    const response = await request(app)
      .get(`/api/users/${VALID_USER_ID}/trust`)
      .set('x-test-user-id', '550e8400-e29b-41d4-a716-446655440001');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/Forbidden/i);
  });
});
