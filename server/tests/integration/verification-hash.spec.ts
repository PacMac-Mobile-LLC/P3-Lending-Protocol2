import request from 'supertest';
import app from '../../src/index';
import { VerificationService } from '../../src/services/verificationService';

describe('POST /api/verification/hash', () => {
  it('returns 400 when snapshot_hash is missing', async () => {
    const response = await request(app).post('/api/verification/hash').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/Missing snapshot_hash/i);
  });

  it('returns validity payload for provided snapshot hash', async () => {
    vi.spyOn(VerificationService, 'verifySnapshotHash').mockResolvedValueOnce({
      isValid: true,
      snapshotTime: '2026-02-16T00:00:00.000Z',
    });

    const response = await request(app)
      .post('/api/verification/hash')
      .send({ snapshot_hash: '0xabc' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      is_valid: true,
      snapshot_time: '2026-02-16T00:00:00.000Z',
    });
  });
});
