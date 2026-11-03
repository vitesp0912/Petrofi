-- PetroFI centralized error logs
-- Run in the Supabase SQL editor on the live project.
-- Writes go through service_role (server APIs). Ordinary users cannot read or write rows.

create extension if not exists pgcrypto;

create table if not exists public.error_logs (
    id uuid primary key default gen_random_uuid(),
    correlation_id text,
    fingerprint text not null,
    occurred_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    occurrence_count integer not null default 1 check (occurrence_count > 0),

    source text not null,
    severity text not null,
    module text not null,
    error_type text not null,
    message text not null,
    stack text,
    details jsonb not null default '{}'::jsonb,

    user_id uuid,
    pump_id uuid,

    endpoint text,
    http_method text,
    request_payload jsonb,
    response_status integer,
    page_url text,
    user_agent text,
    environment text,

    constraint error_logs_source_check
        check (source = any (array['frontend', 'backend', 'database', 'api'])),
    constraint error_logs_severity_check
        check (severity = any (array['warning', 'error', 'critical'])),
    constraint error_logs_module_check
        check (module = any (array[
            'authentication',
            'dashboard',
            'reports',
            'subscriptions',
            'payments',
            'pump_management',
            'demo',
            'legal',
            'general'
        ]))
);

create index if not exists error_logs_occurred_at_idx
    on public.error_logs (occurred_at desc);

create index if not exists error_logs_last_seen_idx
    on public.error_logs (last_seen_at desc);

create index if not exists error_logs_pump_occurred_idx
    on public.error_logs (pump_id, occurred_at desc)
    where pump_id is not null;

create index if not exists error_logs_user_occurred_idx
    on public.error_logs (user_id, occurred_at desc)
    where user_id is not null;

create index if not exists error_logs_module_severity_idx
    on public.error_logs (module, severity, occurred_at desc);

create index if not exists error_logs_error_type_idx
    on public.error_logs (error_type, occurred_at desc);

create index if not exists error_logs_source_idx
    on public.error_logs (source, occurred_at desc);

create index if not exists error_logs_fingerprint_recent_idx
    on public.error_logs (fingerprint, last_seen_at desc);

create index if not exists error_logs_correlation_idx
    on public.error_logs (correlation_id)
    where correlation_id is not null;

create index if not exists error_logs_details_gin_idx
    on public.error_logs using gin (details);

alter table public.error_logs enable row level security;

drop policy if exists error_logs_no_client_select on public.error_logs;
drop policy if exists error_logs_no_client_insert on public.error_logs;
drop policy if exists error_logs_no_client_update on public.error_logs;
drop policy if exists error_logs_no_client_delete on public.error_logs;

-- Explicit deny for browser roles. Service role bypasses RLS.
revoke all on table public.error_logs from anon, authenticated;
grant select, insert, update, delete on table public.error_logs to service_role;

create or replace function public.upsert_error_log(
    p_fingerprint text,
    p_source text,
    p_severity text,
    p_module text,
    p_error_type text,
    p_message text,
    p_stack text default null,
    p_details jsonb default '{}'::jsonb,
    p_user_id uuid default null,
    p_pump_id uuid default null,
    p_endpoint text default null,
    p_http_method text default null,
    p_request_payload jsonb default null,
    p_response_status integer default null,
    p_page_url text default null,
    p_user_agent text default null,
    p_environment text default null,
    p_correlation_id text default null,
    p_dedupe_minutes integer default 15
)
returns public.error_logs
language plpgsql
security definer
set search_path = public
as $$
declare
    existing public.error_logs;
    inserted public.error_logs;
    window_minutes integer := greatest(coalesce(p_dedupe_minutes, 15), 1);
begin
    if coalesce(auth.role(), '') is distinct from 'service_role' then
        raise exception 'forbidden' using errcode = '42501';
    end if;

    if p_fingerprint is null or length(trim(p_fingerprint)) = 0 then
        raise exception 'fingerprint required';
    end if;

    select *
    into existing
    from public.error_logs
    where fingerprint = p_fingerprint
      and last_seen_at >= now() - make_interval(mins => window_minutes)
    order by last_seen_at desc
    limit 1
    for update;

    if found then
        update public.error_logs
        set
            last_seen_at = now(),
            occurrence_count = occurrence_count + 1,
            severity = case
                when p_severity = 'critical' or severity = 'critical' then 'critical'
                when p_severity = 'error' or severity = 'error' then 'error'
                else severity
            end,
            message = coalesce(nullif(p_message, ''), message),
            stack = coalesce(p_stack, stack),
            details = case
                when p_details is null or p_details = '{}'::jsonb then details
                else coalesce(details, '{}'::jsonb) || p_details
            end,
            response_status = coalesce(p_response_status, response_status),
            request_payload = coalesce(p_request_payload, request_payload),
            page_url = coalesce(p_page_url, page_url),
            user_agent = coalesce(p_user_agent, user_agent),
            correlation_id = coalesce(p_correlation_id, correlation_id),
            user_id = coalesce(p_user_id, user_id),
            pump_id = coalesce(p_pump_id, pump_id)
        where id = existing.id
        returning * into inserted;
        return inserted;
    end if;

    insert into public.error_logs (
        fingerprint,
        source,
        severity,
        module,
        error_type,
        message,
        stack,
        details,
        user_id,
        pump_id,
        endpoint,
        http_method,
        request_payload,
        response_status,
        page_url,
        user_agent,
        environment,
        correlation_id
    ) values (
        trim(p_fingerprint),
        p_source,
        p_severity,
        p_module,
        left(trim(p_error_type), 120),
        left(coalesce(p_message, 'unknown error'), 16000),
        case when p_stack is null then null else left(p_stack, 64000) end,
        coalesce(p_details, '{}'::jsonb),
        p_user_id,
        p_pump_id,
        case when p_endpoint is null then null else left(p_endpoint, 500) end,
        case when p_http_method is null then null else left(upper(p_http_method), 16) end,
        p_request_payload,
        p_response_status,
        case when p_page_url is null then null else left(p_page_url, 1000) end,
        case when p_user_agent is null then null else left(p_user_agent, 512) end,
        case when p_environment is null then null else left(p_environment, 40) end,
        case when p_correlation_id is null then null else left(p_correlation_id, 120) end
    )
    returning * into inserted;

    return inserted;
end;
$$;

revoke all on function public.upsert_error_log(
    text, text, text, text, text, text, text, jsonb, uuid, uuid, text, text, jsonb, integer, text, text, text, text, integer
) from public, anon, authenticated;

grant execute on function public.upsert_error_log(
    text, text, text, text, text, text, text, jsonb, uuid, uuid, text, text, jsonb, integer, text, text, text, text, integer
) to service_role;

comment on table public.error_logs is
    'Centralized PetroFI portal failures. Service-role writes only; inspect in Supabase with elevated access.';

comment on function public.upsert_error_log is
    'Service-role only upsert that dedupes identical fingerprints within a time window.';
