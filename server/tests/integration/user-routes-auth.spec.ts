import request from 'supertest';
import app from '../../src/index';
import { UserService } from '../../src/services/userService';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('User routes auth and profile behavior', () => {
  it('rejects unauthenticated current-user requests', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns current user profile when authenticated', async () => {
    vi.spyOn(UserService, 'getUserById').mockResolvedValueOnce({
      id: USER_ID,
      wallet_address: '0xabc',
      kyc_tier: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } as any);

    const response = await request(app)
      .get('/api/users')
      .set('x-test-user-id', USER_ID);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(USER_ID);
  });

  it('forbids reading a different user profile without privileged role', async () => {
    const response = await request(app)
      .get(`/api/users/${USER_ID}`)
      .set('x-test-user-id', '550e8400-e29b-41d4-a716-446655440001');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('allows admin role to read another user profile', async () => {
    vi.spyOn(UserService, 'getUserById').mockResolvedValueOnce({
      id: USER_ID,
      wallet_address: '0xabc',
      kyc_tier: 2,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } as any);

    const response = await request(app)
      .get(`/api/users/${USER_ID}`)
      .set('x-test-user-id', '550e8400-e29b-41d4-a716-446655440001')
      .set('x-test-user-roles', 'admin');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
