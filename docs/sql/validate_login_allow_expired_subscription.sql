-- Website-only login RPCs for petrofi.in.
-- Does NOT change validate_phone_for_login / validate_email_for_login (PetroFI app keeps those).
-- New functions allow expired / inactive subscriptions to log in and renew.
-- Still require: user active (when a users row exists), pump approved, pump active.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.validate_email_for_web_login(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized text;
  user_record record;
  sub_status text;
  sub_end timestamptz;
  pump_ok boolean;
  overall_active boolean;
BEGIN
  normalized := lower(trim(COALESCE(p_email, '')));
  IF normalized = '' OR position('@' in normalized) = 0 THEN
    RETURN jsonb_build_object('exists', false, 'isActive', false);
  END IF;

  SELECT
    u.is_active AS user_active,
    u.pump_id,
    p.registration_status,
    p.is_active AS pump_active,
    s.status AS subscription_status,
    s.end_date AS subscription_end
  INTO user_record
  FROM public.users u
  LEFT JOIN public.pumps p ON p.id = u.pump_id
  LEFT JOIN LATERAL (
    SELECT status, end_date, created_at
    FROM public.subscriptions
    WHERE pump_id = u.pump_id
    ORDER BY
      CASE WHEN lower(COALESCE(status, '')) = 'active' THEN 0 ELSE 1 END,
      end_date DESC NULLS LAST,
      created_at DESC NULLS LAST
    LIMIT 1
  ) s ON true
  WHERE u.email IS NOT NULL AND lower(u.email) = normalized
  LIMIT 1;

  IF FOUND THEN
    sub_status := lower(COALESCE(user_record.subscription_status, 'pending'));
    sub_end := user_record.subscription_end;
    pump_ok :=
      user_record.registration_status = 'approved'
      AND COALESCE(user_record.pump_active, false) = true;
    overall_active :=
      COALESCE(user_record.user_active, false)
      AND pump_ok;

    RETURN jsonb_build_object(
      'exists', true,
      'isActive', overall_active,
      'registrationStatus', user_record.registration_status,
      'subscriptionStatus', sub_status,
      'subscriptionEnd', sub_end
    );
  END IF;

  RETURN jsonb_build_object('exists', false, 'isActive', false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_phone_for_web_login(phone_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  digits text;
  user_record record;
  pump_record record;
  sub_status text;
  sub_end timestamptz;
  pump_ok boolean;
  overall_active boolean;
BEGIN
  digits := right(regexp_replace(COALESCE(phone_number, ''), '[^0-9]', '', 'g'), 10);
  IF length(digits) <> 10 THEN
    RETURN jsonb_build_object(
      'exists', false,
      'isActive', false,
      'userType', null
    );
  END IF;

  SELECT
    u.is_active AS user_active,
    u.pump_id,
    p.registration_status,
    p.is_active AS pump_active,
    s.status AS subscription_status,
    s.end_date AS subscription_end
  INTO user_record
  FROM public.users u
  LEFT JOIN public.pumps p ON p.id = u.pump_id
  LEFT JOIN LATERAL (
    SELECT status, end_date, created_at
    FROM public.subscriptions
    WHERE pump_id = u.pump_id
    ORDER BY
      CASE WHEN lower(COALESCE(status, '')) = 'active' THEN 0 ELSE 1 END,
      end_date DESC NULLS LAST,
      created_at DESC NULLS LAST
    LIMIT 1
  ) s ON true
  WHERE u.phone = digits
  LIMIT 1;

  IF FOUND THEN
    sub_status := lower(COALESCE(user_record.subscription_status, 'pending'));
    sub_end := user_record.subscription_end;
    pump_ok :=
      user_record.registration_status = 'approved'
      AND COALESCE(user_record.pump_active, false) = true;
    overall_active :=
      COALESCE(user_record.user_active, false)
      AND pump_ok;

    RETURN jsonb_build_object(
      'exists', true,
      'isActive', overall_active,
      'userType', 'existing_user',
      'registrationStatus', user_record.registration_status,
      'subscriptionStatus', sub_status,
      'subscriptionEnd', sub_end
    );
  END IF;

  SELECT
    p.id,
    p.is_active,
    p.registration_status,
    s.status AS subscription_status,
    s.end_date AS subscription_end
  INTO pump_record
  FROM public.pumps p
  LEFT JOIN LATERAL (
    SELECT status, end_date, created_at
    FROM public.subscriptions
    WHERE pump_id = p.id
    ORDER BY
      CASE WHEN lower(COALESCE(status, '')) = 'active' THEN 0 ELSE 1 END,
      end_date DESC NULLS LAST,
      created_at DESC NULLS LAST
    LIMIT 1
  ) s ON true
  WHERE p.owner_phone = digits OR p.phone = digits
  LIMIT 1;

  IF FOUND THEN
    sub_status := lower(COALESCE(pump_record.subscription_status, 'pending'));
    sub_end := pump_record.subscription_end;
    pump_ok :=
      pump_record.registration_status = 'approved'
      AND COALESCE(pump_record.is_active, false) = true;
    overall_active := pump_ok;

    RETURN jsonb_build_object(
      'exists', true,
      'isActive', overall_active,
      'userType', 'first_time_owner',
      'registrationStatus', pump_record.registration_status,
      'subscriptionStatus', sub_status,
      'subscriptionEnd', sub_end
    );
  END IF;

  RETURN jsonb_build_object(
    'exists', false,
    'isActive', false,
    'userType', null
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.validate_email_for_web_login(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_phone_for_web_login(text) TO anon, authenticated;
