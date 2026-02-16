import request from 'supertest';
import app from '../../src/index';
import { VerificationService } from '../../src/services/verificationService';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('Verification routes auth and behavior', () => {
  it('requires auth for KYC submission', async () => {
    const response = await request(app)
      .post('/api/verification/kyc')
      .send({ requested_tier: 2 });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('submits KYC when authenticated', async () => {
    vi.spyOn(VerificationService, 'submitKYC').mockResolvedValueOnce({
      id: USER_ID,
      wallet_address: null,
      kyc_tier: 2,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } as any);

    const response = await request(app)
      .post('/api/verification/kyc')
      .set('x-test-user-id', USER_ID)
      .send({ requested_tier: 2, provider: 'persona' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.kyc_tier).toBe(2);
  });

  it('returns verification status for self', async () => {
    vi.spyOn(VerificationService, 'getVerificationStatus').mockResolvedValueOnce({
      user_id: USER_ID,
      kyc_tier: 2,
      status_updated_at: '2026-01-01T00:00:00.000Z',
      latest_trust_snapshot: null,
    } as any);

    const response = await request(app)
      .get(`/api/verification/status/${USER_ID}`)
      .set('x-test-user-id', USER_ID);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
