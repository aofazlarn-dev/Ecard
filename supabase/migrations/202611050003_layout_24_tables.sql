alter table public.wedding_tables drop constraint wedding_tables_layout_slot_check;
alter table public.wedding_tables add constraint wedding_tables_layout_slot_check check (layout_slot between 1 and 24);
