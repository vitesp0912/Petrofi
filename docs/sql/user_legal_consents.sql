-- user_legal_consents already exists.
-- Run this in the Supabase SQL editor so a purchase can store REFUND_POLICY.
-- Terms and privacy rows already allowed by the check stay allowed.

alter table public.user_legal_consents
    drop constraint if exists user_legal_consents_document_type_check;

alter table public.user_legal_consents
    add constraint user_legal_consents_document_type_check check (
        document_type = any (array[
            'TERMS_OF_SERVICE'::text,
            'PRIVACY_POLICY'::text,
            'REFUND_POLICY'::text
        ])
    );
