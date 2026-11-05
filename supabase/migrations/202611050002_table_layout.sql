alter table public.wedding_tables add column layout_slot integer check (layout_slot between 1 and 16);
create unique index wedding_tables_layout_slot_unique on public.wedding_tables (layout_slot) where layout_slot is not null;
