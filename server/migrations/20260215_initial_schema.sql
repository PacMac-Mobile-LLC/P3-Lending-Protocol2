-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL CHECK (wallet_address = LOWER(wallet_address)),
    kyc_tier INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 2. Behavioral Signals Table
CREATE TABLE IF NOT EXISTS behavioral_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL,
    severity INTEGER CHECK (severity >= 1 AND severity <= 10),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavioral_signals_user_id ON behavioral_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_signals_created_at ON behavioral_signals(created_at);

-- 3. Loan Activity Table
CREATE TABLE IF NOT EXISTS loan_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID NOT NULL REFERENCES users(id),
    lender_id UUID NOT NULL REFERENCES users(id),
    amount_usd NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_activity_borrower_id ON loan_activity(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loan_activity_created_at ON loan_activity(created_at);

-- 4. Repayment History Table
CREATE TABLE IF NOT EXISTS repayment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loan_activity(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    is_late BOOLEAN DEFAULT FALSE,
    tx_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repayment_history_loan_id ON repayment_history(loan_id);
CREATE INDEX IF NOT EXISTS idx_repayment_history_created_at ON repayment_history(created_at);

-- 5. Trust Score Snapshots Table
CREATE TABLE IF NOT EXISTS trust_score_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    risk_tier INTEGER,
    model_version TEXT NOT NULL,
    feature_vector_hash TEXT NOT NULL,
    snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_score_snapshots_user_id ON trust_score_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_score_snapshots_snapshot_time ON trust_score_snapshots(snapshot_time);
CREATE INDEX IF NOT EXISTS idx_trust_score_snapshots_created_at ON trust_score_snapshots(created_at);

-- Performance Index for Scoring Lookups
CREATE INDEX IF NOT EXISTS idx_trust_snapshots_user_time ON trust_score_snapshots(user_id, snapshot_time DESC);

-- 6. Fraud Flags Table
CREATE TABLE IF NOT EXISTS fraud_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    evidence_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_flags_user_id ON fraud_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_created_at ON fraud_flags(created_at);

-- 7. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_loan_activity_updated_at BEFORE UPDATE ON loan_activity FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
