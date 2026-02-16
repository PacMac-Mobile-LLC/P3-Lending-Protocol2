import { UserController } from '../../src/controllers/userController';
import { TrustService } from '../../src/services/trustService';

const createResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('UserController.getUserTrust', () => {
  it('calls next on service errors', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const req: any = {
      params: { user_id: userId },
      auth: { userId, roles: ['authenticated'] },
      accessToken: 'test-access-token',
    };
    const res = createResponse();
    const next = vi.fn();

    vi.spyOn(TrustService, 'getLatestTrustSnapshot').mockRejectedValueOnce(new Error('db-down'));

    await UserController.getUserTrust(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
