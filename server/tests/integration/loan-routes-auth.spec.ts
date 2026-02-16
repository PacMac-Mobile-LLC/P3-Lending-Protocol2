import request from 'supertest';
import app from '../../src/index';
import { LoanService } from '../../src/services/loanService';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('Loan routes auth and behavior', () => {
  it('rejects unauthenticated list requests', async () => {
    const response = await request(app).get('/api/loans');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('lists loans for authenticated user', async () => {
    vi.spyOn(LoanService, 'listLoansForUser').mockResolvedValueOnce([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        borrower_id: USER_ID,
        lender_id: USER_ID,
        amount_usd: '1000',
        interest_rate: '12',
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ] as any);

    const response = await request(app)
      .get('/api/loans')
      .set('x-test-user-id', USER_ID);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('validates create request payload', async () => {
    const response = await request(app)
      .post('/api/loans/request')
      .set('x-test-user-id', USER_ID)
      .send({ amount_usd: -1, interest_rate: 10 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('creates a loan request for valid payloads', async () => {
    vi.spyOn(LoanService, 'createLoanRequest').mockResolvedValueOnce({
      id: '550e8400-e29b-41d4-a716-446655440011',
      borrower_id: USER_ID,
      lender_id: USER_ID,
      amount_usd: '1000',
      interest_rate: '8',
      status: 'pending',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } as any);

    const response = await request(app)
      .post('/api/loans/request')
      .set('x-test-user-id', USER_ID)
      .send({ amount_usd: 1000, interest_rate: 8 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
