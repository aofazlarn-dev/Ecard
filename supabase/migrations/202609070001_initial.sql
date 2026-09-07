-- Run once in a new Supabase project's SQL editor, or with supabase db push.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
create policy "read own admin membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(btrim(full_name)) between 1 and 200),
  phone text not null default '' check (length(phone) <= 50),
  email text not null default '' check (length(email) <= 254),
  attendance_status text not null check (attendance_status in ('attending','declined')),
  host_side text not null check (host_side in ('bride','groom','both','other')),
  guest_group text not null check (guest_group in ('ญาติ','เพื่อนประถม','เพื่อนมัธยม','เพื่อนมหาวิทยาลัย','เพื่อนร่วมงาน','อื่น ๆ')),
  group_detail text not null default '' check (length(group_detail) <= 200),
  guest_count integer not null check ((attendance_status='attending' and guest_count between 1 and 100) or (attendance_status='declined' and guest_count=0)),
  remark text not null default '' check (length(remark) <= 2000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rsvps_submitted_at_idx on public.rsvps(submitted_at desc, id);
alter table public.rsvps enable row level security;
revoke all on public.rsvps from anon, authenticated;
grant select, insert, update, delete on public.rsvps to authenticated;
create policy "admins manage rsvps" on public.rsvps for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Keep guest edit credentials out of the public API schema and CSV exports.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.rsvp_receipts (
  token_hash text primary key,
  rsvp_id uuid not null unique references public.rsvps(id) on delete cascade
);
alter table private.rsvp_receipts enable row level security;

create function public.touch_rsvp() returns trigger language plpgsql set search_path='' as $$
begin
  new.updated_at = now();
  new.submitted_at = old.submitted_at;
  return new;
end;
$$;
create trigger rsvps_updated before update on public.rsvps for each row execute function public.touch_rsvp();

-- Only the CAPTCHA-verified Edge Function may call this function.
-- Hash is generated on the server from a random 256-bit browser receipt.
create function public.submit_rsvp(payload jsonb, receipt_hash text) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  existing_id uuid;
  result_id uuid;
  attendance text := payload->>'attendance_status';
  people integer;
begin
  if receipt_hash is null or receipt_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid receipt'; end if;
  if attendance = 'declined' then people := 0; else people := (payload->>'guest_count')::integer; end if;
  -- Serialize retries using the same receipt; concurrent submissions are idempotent.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(receipt_hash, 0));
  select rsvp_id into existing_id from private.rsvp_receipts where token_hash = receipt_hash;
  if existing_id is null then
    insert into public.rsvps(full_name,phone,email,attendance_status,host_side,guest_group,group_detail,guest_count,remark)
    values(btrim(payload->>'full_name'),coalesce(payload->>'phone',''),coalesce(payload->>'email',''),attendance,payload->>'host_side',payload->>'guest_group',coalesce(payload->>'group_detail',''),people,coalesce(payload->>'remark','')) returning id into result_id;
    insert into private.rsvp_receipts(token_hash,rsvp_id) values(receipt_hash,result_id);
  else
    update public.rsvps set full_name=btrim(payload->>'full_name'),phone=coalesce(payload->>'phone',''),email=coalesce(payload->>'email',''),attendance_status=attendance,host_side=payload->>'host_side',guest_group=payload->>'guest_group',group_detail=coalesce(payload->>'group_detail',''),guest_count=people,remark=coalesce(payload->>'remark','') where id=existing_id returning id into result_id;
  end if;
  return result_id;
end;
$$;
revoke all on function public.submit_rsvp(jsonb,text) from public, anon, authenticated;
grant execute on function public.submit_rsvp(jsonb,text) to service_role;
