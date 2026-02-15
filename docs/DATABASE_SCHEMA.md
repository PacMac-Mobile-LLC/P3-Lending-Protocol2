# P3 Reputation Engine: Database Schema Specification

This schema is designed for PostgreSQL (Supabase) to support off-chain behavioral tracking, AI reputation scoring, and financial auditing.

---

## 1. Identity & Core Profiles

### `profiles`
Central user registry linking Web3 identity to the reputation system.
- `id`: `uuid` (PK) - Internal unique identifier.
- `wallet_address`: `text` (Unique) - Ethereum public address.
- `kyc_tier`: `integer` - Current verification level (0: None, 1: Basic, 2: Full).
- `created_at`: `timestamptz` - Account initialization time.
- `updated_at`: `timestamptz` - Last profile modification.

### `identity_verifications`
Historical log of KYC/AML attempts and results.
- `id`: `uuid` (PK)
- `user_id`: `uuid` (FK -> `profiles.id`)
- `provider`: `text` - External KYC provider (e.g., "Persona", "Sumsub").
- `status`: `text` - Result (e.g., "passed", "failed", "pending").
- `raw_response`: `jsonb` - Full payload from verification provider.
- `timestamp`: `timestamptz`

---

## 2. Behavioral Signals & Financial Context

### `behavioral_signals`
Granular log of non-financial trust signals.
- `id`: `bigint` (PK)
- `user_id`: `uuid` (FK -> `profiles.id`)
- `signal_type`: `text` - Event category (e.g., "mentorship_interaction", "app_engagement").
- `severity`: `integer` - Relative impact on score (1-10).
- `payload`: `jsonb` - Contextual data (e.g., chat logs, mentorship feedback).
- `timestamp`: `timestamptz`

### `loans`
Read-only replica of on-chain loan state for scoring context.
- `id`: `uuid` (PK) - Corresponds to on-chain `loanId`.
- `borrower_id`: `uuid` (FK -> `profiles.id`)
- `lender_id`: `uuid` (FK -> `profiles.id`)
- `amount_usd`: `numeric` - Normalized loan value.
- `interest_rate`: `numeric` - Annualized rate.
- `status`: `text` - Current state (e.g., "active", "repaid", "defaulted").
- `contract_address`: `text` - Address of the escrow vault.

### `repayments`
History of loan fulfillment.
- `id`: `uuid` (PK)
- `loan_id`: `uuid` (FK -> `loans.id`)
- `amount`: `numeric` - Amount paid in this transaction.
- `is_late`: `boolean` - Calculated based on due date.
- `tx_hash`: `text` - Ethereum transaction hash.
- `timestamp`: `timestamptz`

---

## 3. Reputation & AI Scoring Logs

### `reputation_snapshots`
The audit trail for every trust score calculation.
- `id`: `uuid` (PK)
- `user_id`: `uuid` (FK -> `profiles.id`)
- `score`: `integer` - Normalized reputation score (0-100).
- `risk_tier`: `integer` - Category mapped for on-chain consumption.
- `model_version`: `text` - Identifier for the AI weights/logic used (e.g., "p3-alpha-v2").
- `feature_vector_hash`: `text` - Keccak256 hash of the set of inputs used for calculation.
- `snapshot_hash`: `text` - Hash of the full JSON snapshot anchored on-chain.
- `created_at`: `timestamptz` (Default: `now()`)

---

## 4. Compliance & Integrity

### `fraud_flags`
Active and historical fraud investigations.
- `id`: `uuid` (PK)
- `user_id`: `uuid` (FK -> `profiles.id`)
- `reason_code`: `text` - Category (e.g., "sybil_attempt", "identity_theft").
- `is_active`: `boolean` - Whether the flag is currently penalizing the score.
- `evidence_ref`: `text` - Link to audit log or external evidence.
- `created_at`: `timestamptz`

### `audit_logs`
Immutable record of system and administrative actions.
- `id`: `bigint` (PK)
- `actor_id`: `uuid` (FK -> `profiles.id`) - Admin or system user performing action.
- `action`: `text` - Event description (e.g., "manual_score_override").
- `resource_type`: `text` - Table/Module affected.
- `resource_id`: `uuid` - Record identifier.
- `metadata`: `jsonb` - Before/After state comparison.
- `timestamp`: `timestamptz`
