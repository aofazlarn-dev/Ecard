create table public.wedding_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);
alter table public.wedding_tables enable row level security;
revoke all on public.wedding_tables from anon, authenticated;
grant select, insert, update, delete on public.wedding_tables to authenticated;
create policy "admins manage wedding tables" on public.wedding_tables for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter table public.rsvps add column table_id uuid references public.wedding_tables(id) on delete set null;
