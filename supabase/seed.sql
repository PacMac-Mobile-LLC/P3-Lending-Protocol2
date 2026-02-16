-- P3 local seed dataset

insert into public.users (id, wallet_address, kyc_tier)
values
    ('11111111-1111-4111-8111-111111111111', '0x1111111111111111111111111111111111111111', 2),
    ('22222222-2222-4222-8222-222222222222', '0x2222222222222222222222222222222222222222', 1)
on conflict (id) do nothing;

insert into public.loan_activity (id, borrower_id, lender_id, amount_usd, interest_rate, status)
values
    (
        '33333333-3333-4333-8333-333333333333',
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        1000,
        8.5,
        'active'
    )
on conflict (id) do nothing;

insert into public.repayment_history (id, loan_id, amount, is_late, tx_hash)
values
    (
        '44444444-4444-4444-8444-444444444444',
        '33333333-3333-4333-8333-333333333333',
        250,
        false,
        '0xtxhashseed0001'
    )
on conflict (tx_hash) do nothing;

insert into public.trust_score_snapshots (
    id,
    user_id,
    score,
    risk_tier,
    model_version,
    feature_vector_hash,
    snapshot_time
)
values
    (
        '55555555-5555-4555-8555-555555555555',
        '11111111-1111-4111-8111-111111111111',
        82,
        1,
        'p3-alpha-v1',
        '0xfeaturehashseed0001',
        now() - interval '1 day'
    ),
    (
        '66666666-6666-4666-8666-666666666666',
        '22222222-2222-4222-8222-222222222222',
        64,
        2,
        'p3-alpha-v1',
        '0xfeaturehashseed0002',
        now() - interval '12 hours'
    )
on conflict (id) do nothing;

insert into public.audit_log (id, actor_id, action, resource_type, resource_id, metadata)
values
    (
        '77777777-7777-4777-8777-777777777777',
        '11111111-1111-4111-8111-111111111111',
        'seed_bootstrap',
        'users',
        '11111111-1111-4111-8111-111111111111',
        '{"source":"seed"}'::jsonb
    )
on conflict (id) do nothing;
