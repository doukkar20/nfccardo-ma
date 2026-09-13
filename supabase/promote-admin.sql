-- Run after the future administrator has registered and confirmed their email.
-- Replace the placeholder before executing in the Supabase SQL Editor.
update auth.users
set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"role":"admin"}'::jsonb
where lower(email)=lower('REPLACE_WITH_ADMIN_EMAIL');

update public.clients
set role='admin',updated_at=now()
where lower(email)=lower('REPLACE_WITH_ADMIN_EMAIL');
