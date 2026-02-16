import { errorHandler } from '../../src/middleware/errorHandler';

describe('errorHandler', () => {
  it('returns standardized error response', () => {
    const req: any = {};
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    const err = { message: 'boom', status: 418, stack: 'stack-trace' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'boom',
      })
    );
  });
});
