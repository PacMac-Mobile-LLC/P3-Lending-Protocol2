import request from 'supertest';
import app from '../../src/index';
import { AdminService } from '../../src/services/adminService';

describe('Admin routes role enforcement', () => {
  it('returns 403 for authenticated user without admin roles', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('x-test-user-id', '550e8400-e29b-41d4-a716-446655440000');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('returns stats for admin role', async () => {
    vi.spyOn(AdminService, 'getProtocolStats').mockResolvedValueOnce({
      users: 10,
      loans: 5,
      repayments: 3,
      trust_snapshots: 10,
      active_fraud_flags: 1,
    });

    const response = await request(app)
      .get('/api/admin/stats')
      .set('x-test-user-id', '550e8400-e29b-41d4-a716-446655440000')
      .set('x-test-user-roles', 'admin');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.users).toBe(10);
  });
});
