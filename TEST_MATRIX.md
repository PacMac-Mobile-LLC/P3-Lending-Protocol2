# P3 Lending Protocol Test Matrix

This matrix is the active beta hardening inventory and test map.

## 1) Repository Intake Summary

- Frontend app: React + Vite at repository root (`App.tsx`, `components/*`, `services/*`).
- Backend API: Express + TypeScript in `server/`.
- Database assets:
  - legacy migration in `server/migrations/20260215_initial_schema.sql`
  - local Supabase project scaffold in `supabase/` with RLS migration + seeds + SQL tests.
- Smart contracts: Hardhat suite in `contracts/` with escrow + registry contracts and tests.
- Stripe processor/webhooks: still not implemented.

## 2) API Route Inventory

| Area | Feature | Entry Point | Expected Behavior | Current State | Tests | Command |
| --- | --- | --- | --- | --- | --- | --- |
| Backend | Health check | `GET /health` (`server/src/index.ts`) | Returns liveness payload | Implemented | `server/tests/integration/health.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Auth guard | `requireAuth` (`server/src/middleware/auth.ts`) | Rejects missing token; accepts valid auth; supports test-mode deterministic auth headers | Implemented | `server/tests/integration/user-routes-auth.spec.ts`, `server/tests/integration/loan-routes-auth.spec.ts` | `npm --prefix server run test` |
| Backend | User trust snapshot fetch | `GET /api/users/:user_id/trust` | UUID validation + self/admin authorization + latest snapshot/404 | Implemented | `server/tests/integration/user-trust.spec.ts`, `server/tests/unit/userController.spec.ts` | `npm --prefix server run test` |
| Backend | Current user profile | `GET /api/users` | Returns authenticated user profile | Implemented | `server/tests/integration/user-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | User profile by id | `GET /api/users/:id` | Self or privileged role only | Implemented | `server/tests/integration/user-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | User profile update | `PATCH /api/users/:id` | Self or privileged role update for allowed fields | Implemented | `server/tests/integration/user-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Loan list | `GET /api/loans` | Authenticated user sees related loans (borrower/lender) | Implemented | `server/tests/integration/loan-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Loan request submission | `POST /api/loans/request` | Auth + payload validation + creates request record | Implemented | `server/tests/integration/loan-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Loan repayment | `POST /api/loans/repay` | Auth + payload validation + repayment record + status update | Implemented | `server/tests/integration/loan-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Verify snapshot hash | `POST /api/verification/hash` | Requires hash and returns validity payload | Implemented | `server/tests/integration/verification-hash.spec.ts`, `server/tests/unit/verificationController.spec.ts` | `npm --prefix server run test` |
| Backend | KYC submission | `POST /api/verification/kyc` | Authenticated KYC request/update + audit log | Implemented | `server/tests/integration/verification-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Verification status | `GET /api/verification/status/:userId` | Self/admin access + aggregated status response | Implemented | `server/tests/integration/verification-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Snapshot attestation | `POST /api/verification/attestation` | Self/admin attestation record creation | Implemented | `server/tests/integration/verification-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Admin stats | `GET /api/admin/stats` | Admin/risk role only protocol stats | Implemented | `server/tests/integration/admin-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Admin override | `POST /api/admin/override` | Admin/risk role only score override + audit log | Implemented | `server/tests/integration/admin-routes-auth.spec.ts` | `npm --prefix server run test:integration` |
| Backend | Admin audit logs | `GET /api/admin/audit` | Admin/risk role only paginated audit feed | Implemented | `server/tests/integration/admin-routes-auth.spec.ts` | `npm --prefix server run test:integration` |

## 3) Supabase Local + RLS Inventory

| Area | Feature | Entry Point | Expected Behavior | Current State | Tests | Command |
| --- | --- | --- | --- | --- | --- | --- |
| Supabase | Local project scaffold | `supabase/config.toml` | Enables local stack parity with API/Auth/DB | Implemented | Manual startup check | `supabase start` |
| Supabase | Schema + RLS migration | `supabase/migrations/20260216000100_initial_schema_rls.sql` | Core tables + RLS policies for self/admin boundaries | Implemented | SQL policy tests | `supabase db reset` |
| Supabase | Seed dataset | `supabase/seed.sql` | Deterministic fixture rows for users/loans/snapshots/audit | Implemented | Used by local reset | `supabase db reset` |
| Supabase | RLS tests | `supabase/tests/rls.sql` | Validates self access, admin access, and unauthorized denies | Implemented | pgTAP SQL checks | `supabase test db` |

## 4) Contract Inventory

| Area | Feature | Entry Point | Expected Behavior | Current State | Tests | Command |
| --- | --- | --- | --- | --- | --- | --- |
| Contracts | Reputation anchor registry | `contracts/contracts/ReputationAnchorRegistry.sol` | Signature verification, nonce replay protection, tier/hash storage | Implemented | `contracts/test/reputationAnchorRegistry.js` | `npm --prefix contracts test` |
| Contracts | Loan escrow lifecycle | `contracts/contracts/P3LoanEscrow.sol` | Submit/fund/release/repay with registry-based eligibility checks | Implemented | `contracts/test/p3LoanEscrow.js` | `npm --prefix contracts test` |

## 5) Frontend Critical Flow Inventory

| Area | Feature | Entry Point | Expected Behavior | Current State | Tests | Command |
| --- | --- | --- | --- | --- | --- | --- |
| Frontend | Waitlist and landing smoke | `components/LandingPage.tsx` | Landing renders and waitlist UX is available | Partially covered | `tests/e2e/smoke.spec.ts` | `npm run e2e` |
| Frontend | Security helpers | `services/security.ts` | Certificate/password helper logic remains deterministic | Covered | `tests/unit/securityService.spec.ts` | `npm run test` |
| Frontend | Wallet helper | `services/walletService.ts` | Address formatting helper deterministic | Covered | `tests/unit/walletService.spec.ts` | `npm run test` |
| Frontend | Market data formatter | `services/marketDataService.ts` | Market-cap formatting remains stable | Covered | `tests/unit/marketDataService.spec.ts` | `npm run test` |

## 6) Remaining Gaps

| Area | Missing Capability | Expected Target | Current Gap | Resolution Path |
| --- | --- | --- | --- | --- |
| Stripe | Payment intents + webhook verification/idempotency | Backend Stripe endpoints and idempotency ledger | Not implemented | Add `/api/stripe/*`, signature validation, event idempotency table/tests |
| Replay protection (API) | Nonce/signature-based replay defense in off-chain loan request API | Signed request + nonce store | Not implemented in HTTP loan endpoints | Add nonce table, signature checks, replay tests |
| Full user-flow E2E breadth | Borrow/request/fund/repay/admin flows | Playwright suite per core beta flow | Only smoke currently automated | Add full Playwright specs for each core workflow |
| Supabase runtime validation | Run local RLS tests in CI/local | `supabase test db` passing report | Blocked in this environment due Docker daemon unavailable | Run with Docker Desktop active and capture green results |

## 7) Current Automated Coverage

| Layer | Added Test Files | Command | Current Result |
| --- | --- | --- | --- |
| Backend Integration + Auth/Roles | `server/tests/integration/*.spec.ts` | `npm --prefix server run test` | ✅ Passing (24 tests) |
| Backend Unit | `server/tests/unit/*.spec.ts` | `npm --prefix server run test` | ✅ Passing |
| Frontend Unit | `tests/unit/*.spec.ts` | `npm run test` | ✅ Passing (10 tests) |
| Contract Tests | `contracts/test/*.js` | `npm --prefix contracts test` | ✅ Passing (10 tests) |
| Frontend E2E Smoke | `tests/e2e/smoke.spec.ts` | `npm run e2e` | ✅ Passing |
| Full Local CI Sequence | N/A | `npm run ci` | ✅ Passing |

## 8) Execution Rule

For each row: `read -> spec -> failing tests -> fix -> regression test -> matrix status update`.
