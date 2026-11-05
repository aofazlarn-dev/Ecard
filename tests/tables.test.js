import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('table assignment is unique, movable, admin-only and cleared on table deletion', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
    for (const file of ['202609070001_initial.sql', '202611050001_wedding_tables.sql', '202611050002_table_layout.sql', '202611050003_layout_24_tables.sql']) await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
    const admin = '11111111-1111-4111-8111-111111111111';
    await db.query('insert into auth.users values ($1)', [admin]);
    await db.query('insert into public.admin_users values ($1)', [admin]);
    await db.exec('set role authenticated');
    assert.equal((await db.query('select * from public.wedding_tables')).rows.length, 0);
    await assert.rejects(db.query("insert into public.wedding_tables(name) values ('Blocked')"));
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    const tables = await db.query("insert into public.wedding_tables(name) values ('One'), ('Two') returning id");
    await db.query('update public.wedding_tables set layout_slot=1 where id=$1', [tables.rows[0].id]);
    await assert.rejects(db.query('update public.wedding_tables set layout_slot=1 where id=$1', [tables.rows[1].id]));
    await assert.rejects(db.query('update public.wedding_tables set layout_slot=25 where id=$1', [tables.rows[1].id]));
    await db.query('update public.wedding_tables set layout_slot=24 where id=$1', [tables.rows[0].id]);
    assert.equal((await db.query('select layout_slot from public.wedding_tables where id=$1', [tables.rows[0].id])).rows[0].layout_slot, 24);
    const guest = await db.query("insert into public.rsvps(full_name,attendance_status,host_side,guest_group,guest_count) values ('Guest','attending','bride','ญาติ',2) returning id");
    await db.query('update public.rsvps set table_id=$1 where id=$2', [tables.rows[0].id, guest.rows[0].id]);
    await db.query('update public.rsvps set table_id=$1 where id=$2', [tables.rows[1].id, guest.rows[0].id]);
    assert.equal((await db.query('select table_id from public.rsvps')).rows[0].table_id, tables.rows[1].id);
    await db.query('delete from public.wedding_tables where id=$1', [tables.rows[1].id]);
    assert.equal((await db.query('select table_id from public.rsvps')).rows[0].table_id, null);
  } finally { await db.close(); }
});


