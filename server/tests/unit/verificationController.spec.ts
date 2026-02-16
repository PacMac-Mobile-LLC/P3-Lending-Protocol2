import { VerificationController } from '../../src/controllers/verificationController';
import { VerificationService } from '../../src/services/verificationService';

const createResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('VerificationController.verifyHash', () => {
  it('calls next on service errors', async () => {
    const req: any = { body: { snapshot_hash: '0x123' } };
    const res = createResponse();
    const next = vi.fn();

    vi.spyOn(VerificationService, 'verifySnapshotHash').mockRejectedValueOnce(new Error('verification-failed'));

    await VerificationController.verifyHash(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
