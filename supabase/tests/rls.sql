begin;

create extension if not exists pgtap;

select plan(8);

set local role authenticated;

-- User A context
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.app_metadata', '{"p3_role":"member"}', true);

select is(
    (select count(*) from public.users),
    1::bigint,
    'authenticated user can only read their own user row'
);

select is(
    (
        select count(*)
        from public.users
        where id = '22222222-2222-4222-8222-222222222222'
    ),
    0::bigint,
    'authenticated user cannot read another user row'
);

select is(
    (
        select count(*)
        from public.loan_activity
    ),
    1::bigint,
    'authenticated user can read only related loans'
);

select lives_ok(
    $$
    insert into public.loan_activity (borrower_id, lender_id, amount_usd, interest_rate, status)
    values (
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      150,
      5,
      'pending'
    );
    $$,
    'authenticated user can insert loan where borrower_id matches auth.uid()'
);

select throws_ok(
    $$
    insert into public.loan_activity (borrower_id, lender_id, amount_usd, interest_rate, status)
    values (
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111',
      150,
      5,
      'pending'
    );
    $$,
    '42501',
    null,
    'authenticated user cannot insert loan for a different borrower'
);

-- Switch to admin role context through JWT app metadata
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.app_metadata', '{"p3_role":"admin"}', true);

select ok(
    (select count(*) from public.audit_log) >= 1,
    'admin role can read audit log'
);

select lives_ok(
    $$
    insert into public.audit_log (actor_id, action, resource_type, resource_id, metadata)
    values (
      '11111111-1111-4111-8111-111111111111',
      'rls_test_event',
      'users',
      '11111111-1111-4111-8111-111111111111',
      '{"source":"pgtap"}'::jsonb
    );
    $$,
    'admin role can insert into audit log'
);

select set_config('request.jwt.claim.app_metadata', '{"p3_role":"member"}', true);

select throws_ok(
    $$
    insert into public.audit_log (actor_id, action, resource_type, resource_id, metadata)
    values (
      '11111111-1111-4111-8111-111111111111',
      'unauthorized_event',
      'users',
      '11111111-1111-4111-8111-111111111111',
      '{"source":"pgtap"}'::jsonb
    );
    $$,
    '42501',
    null,
    'non-admin cannot insert into audit log'
);

select * from finish();

rollback;
