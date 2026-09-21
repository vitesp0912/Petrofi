-- PetroFI Cashfree payments
-- Run this in the Supabase SQL editor on the live project.
-- Do not skip RLS. The website never writes these tables from the browser.

create table if not exists public.payment_orders (
    id uuid primary key default gen_random_uuid(),
    order_id text not null unique,
    cf_order_id text,
    user_id uuid not null,
    pump_id uuid not null,
    plan_id text not null,
    plan_name text not null,
    months integer not null check (months > 0 and months <= 12),
    amount_base integer not null check (amount_base > 0),
    amount_gst integer not null check (amount_gst >= 0),
    amount_total integer not null check (amount_total > 0),
    currency text not null default 'INR',
    gstin text,
    billing_name text,
    billing_email text,
    billing_phone text,
    status text not null default 'created',
    payment_session_id text,
    cf_payment_id text,
    payment_method text,
    paid_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint payment_orders_status_check
        check (status in ('created', 'pending', 'paid', 'failed', 'expired', 'user_dropped'))
);

create index if not exists payment_orders_user_created_idx
    on public.payment_orders (user_id, created_at desc);

create index if not exists payment_orders_pump_idx
    on public.payment_orders (pump_id);

alter table public.payment_orders enable row level security;

drop policy if exists payment_orders_select_own on public.payment_orders;
create policy payment_orders_select_own
    on public.payment_orders
    for select
    to authenticated
    using (user_id = auth.uid());

revoke insert, update, delete on public.payment_orders from anon, authenticated;
grant select on public.payment_orders to authenticated;

create table if not exists public.payment_webhook_events (
    event_id text primary key,
    order_id text,
    received_at timestamptz not null default now()
);

alter table public.payment_webhook_events enable row level security;
revoke all on public.payment_webhook_events from anon, authenticated;
