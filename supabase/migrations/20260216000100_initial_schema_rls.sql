-- P3 Lending Protocol local Supabase schema + RLS baseline

create extension if not exists "uuid-ossp";

create table if not exists public.users (
    id uuid primary key default uuid_generate_v4(),
    wallet_address text unique,
    kyc_tier integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.behavioral_signals (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    signal_type text not null,
    severity integer check (severity >= 1 and severity <= 10),
    payload jsonb,
    created_at timestamptz default now()
);

create table if not exists public.loan_activity (
    id uuid primary key default uuid_generate_v4(),
    borrower_id uuid not null references public.users(id),
    lender_id uuid references public.users(id),
    amount_usd numeric not null,
    interest_rate numeric not null,
    status text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.repayment_history (
    id uuid primary key default uuid_generate_v4(),
    loan_id uuid not null references public.loan_activity(id) on delete cascade,
    amount numeric not null,
    is_late boolean default false,
    tx_hash text unique not null,
    created_at timestamptz default now()
);

create table if not exists public.trust_score_snapshots (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    score integer check (score >= 0 and score <= 100),
    risk_tier integer,
    model_version text not null,
    feature_vector_hash text not null,
    snapshot_time timestamptz not null,
    created_at timestamptz default now()
);

create table if not exists public.fraud_flags (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    reason_code text not null,
    is_active boolean default true,
    evidence_ref text,
    created_at timestamptz default now()
);

create table if not exists public.audit_log (
    id uuid primary key default uuid_generate_v4(),
    actor_id uuid references public.users(id),
    action text not null,
    resource_type text not null,
    resource_id uuid,
    metadata jsonb,
    created_at timestamptz default now()
);

create index if not exists idx_users_created_at on public.users(created_at);
create index if not exists idx_behavioral_signals_user_id on public.behavioral_signals(user_id);
create index if not exists idx_loan_activity_borrower_id on public.loan_activity(borrower_id);
create index if not exists idx_loan_activity_lender_id on public.loan_activity(lender_id);
create index if not exists idx_repayment_history_loan_id on public.repayment_history(loan_id);
create index if not exists idx_trust_snapshots_user_id on public.trust_score_snapshots(user_id);
create index if not exists idx_fraud_flags_user_id on public.fraud_flags(user_id);
create index if not exists idx_audit_log_actor_id on public.audit_log(actor_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
before update on public.users
for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_loan_activity_updated_at on public.loan_activity;
create trigger update_loan_activity_updated_at
before update on public.loan_activity
for each row execute procedure public.update_updated_at_column();

create or replace function public.current_is_admin()
returns boolean
language sql
stable
as $$
select
    coalesce(
        (auth.jwt() -> 'app_metadata' ->> 'p3_role') in ('admin', 'risk_officer')
        or exists (
            select 1
            from jsonb_array_elements_text(coalesce(auth.jwt() -> 'app_metadata' -> 'p3_roles', '[]'::jsonb)) as r(role)
            where lower(r.role) in ('admin', 'risk_officer')
        ),
        false
    );
$$;

alter table public.users enable row level security;
alter table public.behavioral_signals enable row level security;
alter table public.loan_activity enable row level security;
alter table public.repayment_history enable row level security;
alter table public.trust_score_snapshots enable row level security;
alter table public.fraud_flags enable row level security;
alter table public.audit_log enable row level security;

-- users
create policy "users_select_self_or_admin" on public.users
for select
using (auth.uid() = id or public.current_is_admin());

create policy "users_insert_self_or_service" on public.users
for insert
with check (auth.uid() = id or auth.role() = 'service_role');

create policy "users_update_self_or_admin" on public.users
for update
using (auth.uid() = id or public.current_is_admin())
with check (auth.uid() = id or public.current_is_admin());

-- behavioral_signals
create policy "behavioral_select_self_or_admin" on public.behavioral_signals
for select
using (
    exists (
        select 1 from public.users u
        where u.id = behavioral_signals.user_id
          and (u.id = auth.uid() or public.current_is_admin())
    )
);

create policy "behavioral_insert_self_or_admin" on public.behavioral_signals
for insert
with check (user_id = auth.uid() or public.current_is_admin());

-- loan_activity
create policy "loan_select_self_or_admin" on public.loan_activity
for select
using (
    borrower_id = auth.uid()
    or lender_id = auth.uid()
    or public.current_is_admin()
);

create policy "loan_insert_self_or_admin" on public.loan_activity
for insert
with check (
    borrower_id = auth.uid()
    or public.current_is_admin()
);

create policy "loan_update_self_or_admin" on public.loan_activity
for update
using (
    borrower_id = auth.uid()
    or lender_id = auth.uid()
    or public.current_is_admin()
)
with check (
    borrower_id = auth.uid()
    or lender_id = auth.uid()
    or public.current_is_admin()
);

-- repayment_history
create policy "repayment_select_related_loan" on public.repayment_history
for select
using (
    exists (
        select 1
        from public.loan_activity la
        where la.id = repayment_history.loan_id
          and (
              la.borrower_id = auth.uid()
              or la.lender_id = auth.uid()
              or public.current_is_admin()
          )
    )
);

create policy "repayment_insert_related_loan" on public.repayment_history
for insert
with check (
    exists (
        select 1
        from public.loan_activity la
        where la.id = repayment_history.loan_id
          and (
              la.borrower_id = auth.uid()
              or la.lender_id = auth.uid()
              or public.current_is_admin()
          )
    )
);

-- trust_score_snapshots
create policy "trust_select_self_or_admin" on public.trust_score_snapshots
for select
using (user_id = auth.uid() or public.current_is_admin());

create policy "trust_insert_admin_or_service" on public.trust_score_snapshots
for insert
with check (public.current_is_admin() or auth.role() = 'service_role');

-- fraud_flags
create policy "fraud_select_self_or_admin" on public.fraud_flags
for select
using (user_id = auth.uid() or public.current_is_admin());

create policy "fraud_insert_admin_or_service" on public.fraud_flags
for insert
with check (public.current_is_admin() or auth.role() = 'service_role');

-- audit_log
create policy "audit_select_admin_only" on public.audit_log
for select
using (public.current_is_admin() or auth.role() = 'service_role');

create policy "audit_insert_admin_or_service" on public.audit_log
for insert
with check (public.current_is_admin() or auth.role() = 'service_role');
