-- PetroFI: write payment_orders only through public.save_payment_order.
-- Run in the Supabase SQL editor (postgres). Browser JWTs cannot execute it.

create schema if not exists internal;
revoke all on schema internal from public, anon, authenticated;

create or replace function internal.resolve_plan_id(p_ref text)
returns uuid
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
    plan_uuid uuid;
    ref text := nullif(btrim(p_ref), '');
begin
    if ref is null then
        return null;
    end if;

    if ref ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        select pl.id
          into plan_uuid
        from public.plans pl
        where pl.id = ref::uuid
          and pl.is_active = true
          and pl.code is distinct from 'trial';
        return plan_uuid;
    end if;

    select pl.id
      into plan_uuid
    from public.plans pl
    where pl.code = ref
      and pl.is_active = true
      and pl.code is distinct from 'trial';

    return plan_uuid;
end;
$$;

create or replace function internal.assert_user_belongs_to_pump(p_user_id uuid, p_pump_id uuid)
returns void
language plpgsql
stable
set search_path = public, pg_temp
as $$
begin
    if p_user_id is null or p_pump_id is null then
        raise exception 'user_id and pump_id are required' using errcode = '22023';
    end if;
    if not exists (select 1 from public.pumps p where p.id = p_pump_id) then
        raise exception 'unknown pump' using errcode = '22023';
    end if;
    if not exists (
        select 1
        from public.users u
        where u.id = p_user_id
          and u.pump_id = p_pump_id
    ) then
        raise exception 'user does not belong to pump' using errcode = '22023';
    end if;
end;
$$;

create or replace function internal.assert_amount_matches_plan(
    p_plan_id uuid,
    p_amount numeric,
    p_currency text
)
returns void
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
    plan_total numeric(12, 2);
    plan_currency text;
begin
    if p_plan_id is null then
        raise exception 'plan_id is required' using errcode = '22023';
    end if;
    if p_amount is null or p_amount <= 0 then
        raise exception 'invalid amount' using errcode = '22023';
    end if;

    select round(pl.price_total_inr, 2), upper(pl.currency)
      into plan_total, plan_currency
    from public.plans pl
    where pl.id = p_plan_id
      and pl.is_active = true
      and pl.code is distinct from 'trial';

    if plan_total is null then
        raise exception 'unknown plan' using errcode = '22023';
    end if;
    if round(p_amount, 2) is distinct from plan_total then
        raise exception 'amount does not match plan' using errcode = '22023';
    end if;
    if p_currency is distinct from plan_currency then
        raise exception 'currency does not match plan' using errcode = '22023';
    end if;
end;
$$;

create or replace function internal.assert_cashfree_ids_immutable(
    p_existing_cf_order text,
    p_next_cf_order text,
    p_existing_cf_payment text,
    p_next_cf_payment text
)
returns void
language plpgsql
immutable
as $$
begin
    if p_existing_cf_order is not null
       and p_next_cf_order is not null
       and p_next_cf_order is distinct from p_existing_cf_order then
        raise exception 'cf_order_id is immutable' using errcode = '22023';
    end if;
    if p_existing_cf_payment is not null
       and p_next_cf_payment is not null
       and p_next_cf_payment is distinct from p_existing_cf_payment then
        raise exception 'cf_payment_id is immutable' using errcode = '22023';
    end if;
end;
$$;

create or replace function internal.assert_paid_row_complete(
    p_plan_id uuid,
    p_cf_payment_id text,
    p_paid_at timestamptz
)
returns void
language plpgsql
immutable
as $$
begin
    if p_plan_id is null or p_cf_payment_id is null or p_paid_at is null then
        raise exception 'paid order requires plan_id, cf_payment_id and paid_at' using errcode = '22023';
    end if;
end;
$$;

revoke all on function internal.resolve_plan_id(text) from public, anon, authenticated;
revoke all on function internal.assert_user_belongs_to_pump(uuid, uuid) from public, anon, authenticated;
revoke all on function internal.assert_amount_matches_plan(uuid, numeric, text) from public, anon, authenticated;
revoke all on function internal.assert_cashfree_ids_immutable(text, text, text, text) from public, anon, authenticated;
revoke all on function internal.assert_paid_row_complete(uuid, text, timestamptz) from public, anon, authenticated;

drop function if exists public.save_payment_order(
    text, text, uuid, uuid, numeric, text, uuid, text, text, text, text, text, text, text, text, timestamptz, boolean
);

drop function if exists public.save_payment_order(
    text, text, uuid, uuid, numeric, text, uuid, text, text, text, text, text, text, text, text, timestamptz
);

create or replace function public.save_payment_order(
    p_order_id text,
    p_status text,
    p_user_id uuid default null,
    p_pump_id uuid default null,
    p_amount_total numeric default null,
    p_currency text default null,
    p_plan_id text default null,
    p_gstin text default null,
    p_billing_name text default null,
    p_billing_email text default null,
    p_billing_phone text default null,
    p_cf_order_id text default null,
    p_cf_payment_id text default null,
    p_payment_session_id text default null,
    p_payment_method text default null,
    p_paid_at timestamptz default null
)
returns public.payment_orders
language plpgsql
security definer
set search_path = public, internal, pg_temp
as $$
declare
    rec public.payment_orders;
    next_status text;
    next_currency text;
    next_gstin text;
    next_cf_order text;
    next_cf_payment text;
    next_session text;
    next_method text;
    next_name text;
    next_email text;
    next_phone text;
    next_amount numeric(12, 2);
    next_plan uuid;
    next_user uuid;
    next_pump uuid;
    paid_stamp timestamptz;
    allowed constant text[] := array['created', 'pending', 'paid', 'failed', 'expired', 'user_dropped'];
begin
    if coalesce(auth.role(), '') is distinct from 'service_role' then
        raise exception 'not allowed' using errcode = '42501';
    end if;

    p_order_id := nullif(btrim(p_order_id), '');
    if p_order_id is null or char_length(p_order_id) > 50 or p_order_id !~ '^(PF-[0-9A-F]{8}|pf_[a-zA-Z0-9_]+)$' then
        raise exception 'invalid order_id' using errcode = '22023';
    end if;

    next_status := lower(nullif(btrim(p_status), ''));
    if next_status is null or not (next_status = any (allowed)) then
        raise exception 'invalid status' using errcode = '22023';
    end if;

    next_currency := upper(nullif(btrim(p_currency), ''));
    next_gstin := upper(nullif(regexp_replace(coalesce(p_gstin, ''), '[^0-9A-Z]', '', 'g'), ''));
    if next_gstin is not null and next_gstin !~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$' then
        raise exception 'invalid gstin' using errcode = '22023';
    end if;

    next_cf_order := nullif(btrim(p_cf_order_id), '');
    next_cf_payment := nullif(btrim(p_cf_payment_id), '');
    next_session := nullif(btrim(p_payment_session_id), '');
    next_method := nullif(left(btrim(p_payment_method), 80), '');
    next_name := nullif(left(btrim(p_billing_name), 80), '');
    next_email := nullif(left(lower(btrim(p_billing_email)), 120), '');
    next_phone := nullif(regexp_replace(coalesce(p_billing_phone, ''), '\D', '', 'g'), '');
    if next_phone is not null and char_length(next_phone) not between 10 and 15 then
        raise exception 'invalid billing_phone' using errcode = '22023';
    end if;

    if p_amount_total is not null then
        next_amount := round(p_amount_total, 2);
        if next_amount <= 0 then
            raise exception 'invalid amount' using errcode = '22023';
        end if;
    end if;

    perform pg_advisory_xact_lock(hashtext(p_order_id));

    select * into rec from public.payment_orders where order_id = p_order_id for update;

    next_plan := internal.resolve_plan_id(p_plan_id);

    if rec.id is null then
        if p_user_id is null or p_pump_id is null or next_amount is null or next_plan is null then
            raise exception 'user_id, pump_id, plan_id and amount_total are required to create an order' using errcode = '22023';
        end if;
        if next_currency is null then
            select upper(pl.currency) into next_currency from public.plans pl where pl.id = next_plan;
        end if;
        if next_currency is null or next_currency !~ '^[A-Z]{3}$' then
            raise exception 'invalid currency' using errcode = '22023';
        end if;

        perform internal.assert_user_belongs_to_pump(p_user_id, p_pump_id);
        perform internal.assert_amount_matches_plan(next_plan, next_amount, next_currency);

        paid_stamp := case when next_status = 'paid' then coalesce(p_paid_at, now()) else null end;
        if next_status = 'paid' then
            perform internal.assert_paid_row_complete(next_plan, next_cf_payment, paid_stamp);
        end if;

        insert into public.payment_orders (
            order_id,
            user_id,
            pump_id,
            plan_id,
            amount_total,
            currency,
            gstin,
            billing_name,
            billing_email,
            billing_phone,
            status,
            cf_order_id,
            cf_payment_id,
            payment_session_id,
            payment_method,
            paid_at
        )
        values (
            p_order_id,
            p_user_id,
            p_pump_id,
            next_plan,
            next_amount,
            next_currency,
            next_gstin,
            next_name,
            next_email,
            next_phone,
            next_status,
            next_cf_order,
            next_cf_payment,
            next_session,
            next_method,
            paid_stamp
        )
        returning * into rec;

        return rec;
    end if;

    if rec.status = 'paid' and next_status is distinct from 'paid' then
        raise exception 'paid order cannot change status' using errcode = '22023';
    end if;

    next_user := coalesce(p_user_id, rec.user_id);
    next_pump := coalesce(p_pump_id, rec.pump_id);
    next_plan := coalesce(rec.plan_id, next_plan);
    next_amount := coalesce(next_amount, rec.amount_total);
    if next_currency is null then
        next_currency := rec.currency;
    end if;
    if next_currency is null or next_currency !~ '^[A-Z]{3}$' then
        raise exception 'invalid currency' using errcode = '22023';
    end if;

    if p_user_id is not null and p_user_id is distinct from rec.user_id then
        raise exception 'user_id mismatch' using errcode = '22023';
    end if;
    if p_pump_id is not null and p_pump_id is distinct from rec.pump_id then
        raise exception 'pump_id mismatch' using errcode = '22023';
    end if;
    if next_plan is not null and rec.plan_id is not null and next_plan is distinct from rec.plan_id then
        raise exception 'plan_id mismatch' using errcode = '22023';
    end if;
    if p_amount_total is not null and round(p_amount_total, 2) is distinct from rec.amount_total then
        raise exception 'amount mismatch' using errcode = '22023';
    end if;
    if p_currency is not null and next_currency is distinct from rec.currency then
        raise exception 'currency mismatch' using errcode = '22023';
    end if;

    perform internal.assert_user_belongs_to_pump(next_user, next_pump);
    perform internal.assert_amount_matches_plan(next_plan, next_amount, next_currency);
    perform internal.assert_cashfree_ids_immutable(rec.cf_order_id, next_cf_order, rec.cf_payment_id, next_cf_payment);

    next_cf_order := coalesce(rec.cf_order_id, next_cf_order);
    next_cf_payment := coalesce(rec.cf_payment_id, next_cf_payment);

    paid_stamp := rec.paid_at;
    if next_status = 'paid' then
        paid_stamp := coalesce(rec.paid_at, p_paid_at, now());
        perform internal.assert_paid_row_complete(next_plan, next_cf_payment, paid_stamp);
    end if;

    update public.payment_orders
    set
        status = next_status,
        plan_id = next_plan,
        gstin = coalesce(next_gstin, rec.gstin),
        billing_name = coalesce(next_name, rec.billing_name),
        billing_email = coalesce(next_email, rec.billing_email),
        billing_phone = coalesce(next_phone, rec.billing_phone),
        cf_order_id = next_cf_order,
        cf_payment_id = next_cf_payment,
        payment_session_id = coalesce(next_session, rec.payment_session_id),
        payment_method = coalesce(next_method, rec.payment_method),
        paid_at = paid_stamp,
        updated_at = now()
    where id = rec.id
    returning * into rec;

    return rec;
end;
$$;

revoke all on function public.save_payment_order(
    text, text, uuid, uuid, numeric, text, text, text, text, text, text, text, text, text, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.save_payment_order(
    text, text, uuid, uuid, numeric, text, text, text, text, text, text, text, text, text, text, timestamptz
) to service_role;

comment on function public.save_payment_order(
    text, text, uuid, uuid, numeric, text, text, text, text, text, text, text, text, text, text, timestamptz
) is 'Service-role only upsert for payment_orders. p_plan_id may be plans.id or plans.code; stored value is always plans.id.';

-- Table grants: anon/authenticated must not SELECT, TRUNCATE, or attach triggers.
-- The website reads and writes this table only through /api/* + this RPC.

alter table public.payment_orders enable row level security;

drop policy if exists payment_orders_select_own on public.payment_orders;

revoke all on table public.payment_orders from public, anon, authenticated;

grant select, insert, update, delete on table public.payment_orders to service_role;

notify pgrst, 'reload schema';

