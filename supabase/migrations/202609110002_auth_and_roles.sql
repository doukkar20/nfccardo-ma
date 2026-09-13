alter table public.clients add column if not exists role text not null default 'client' check (role in ('client','admin'));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare base_slug text;
begin
  base_slug:=lower(regexp_replace(coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),'[^a-zA-Z0-9]+','-','g'));
  insert into public.clients(id,name,email,slug,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),new.email,trim(both '-' from base_slug)||'-'||substr(new.id::text,1,6),coalesce(new.raw_app_meta_data->>'role','client'));
  insert into public.card_profiles(client_id,email) values(new.id,new.email);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select coalesce((auth.jwt()->'app_metadata'->>'role')='admin',false) $$;

create policy "public reads active clients" on public.clients for select to anon,authenticated using(subscription_status='active' or auth.uid()=id or public.is_admin());
create policy "clients insert own orders" on public.orders for insert to authenticated with check(auth.uid()=client_id);
create policy "admins manage clients" on public.clients for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins manage profiles" on public.card_profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins manage orders" on public.orders for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "users update profile assets" on storage.objects for update to authenticated using(bucket_id='profile-assets' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='profile-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete profile assets" on storage.objects for delete to authenticated using(bucket_id='profile-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "admins read receipts" on storage.objects for select to authenticated using(bucket_id='payment-receipts' and public.is_admin());

create table if not exists public.profile_events(id bigint generated always as identity primary key,client_id uuid not null references public.clients(id) on delete cascade,event_type text not null check(event_type in ('view','share','contact')),created_at timestamptz not null default now());
create index if not exists profile_events_client_created_idx on public.profile_events(client_id,created_at desc);
alter table public.profile_events enable row level security;
create policy "anyone creates profile events" on public.profile_events for insert to anon,authenticated with check(true);
create policy "clients read own profile events" on public.profile_events for select to authenticated using(auth.uid()=client_id or public.is_admin());
