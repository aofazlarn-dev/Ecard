import { createClient } from '@supabase/supabase-js';
import { normalizeRsvp } from './domain';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const demo = !configured && (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true');
export const supabase = configured ? createClient(url, key) : null;
export const storageScope = demo ? 'demo' : (url || 'unconfigured');
export const answerKey = `wedding-my-answer-v1:${storageScope}`;
const STORE = 'wedding-demo-rsvps-v1';
export const readDemo = () => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } };
const writeDemo = rows => localStorage.setItem(STORE, JSON.stringify(rows));
export function editToken() {
  const key = `wedding-edit-token-v1:${storageScope}`;
  let token = localStorage.getItem(key);
  if (!token) { token = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem(key, token); }
  return token;
}
export async function submitRsvp(input, token, captcha) {
  const payload = normalizeRsvp(input);
  if (demo) {
    const rows = readDemo(); const previous = rows.find(r => r.demo_token === token);
    const record = { ...payload, id: previous?.id || crypto.randomUUID(), demo_token: token, submitted_at: previous?.submitted_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    writeDemo([...rows.filter(r => r.id !== record.id), record]); return record;
  }
  if (!supabase) throw new Error('ระบบยังไม่เปิดรับ RSVP กรุณาติดต่อบ่าวสาว');
  const { data, error } = await supabase.functions.invoke('public-rsvp', { body: { payload, edit_token: token, captcha } });
  if (error || data?.error) throw new Error('บันทึกไม่สำเร็จ กรุณาลองใหม่ ข้อมูลในฟอร์มยังอยู่ครบ');
  return data;
}
export async function listRsvps() {
  if (demo) return readDemo().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  // Paginate past the Supabase default 1,000-row response limit.
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('rsvps').select('*').order('submitted_at', { ascending: false }).order('id').range(from, from + 999);
    if (error) throw error;
    rows.push(...data); if (data.length < 1000) return rows;
  }
}
export async function adminSave(input, id) {
  const payload = normalizeRsvp(input);
  if (demo) {
    const rows = readDemo(), previous = rows.find(r => r.id === id);
    writeDemo([...rows.filter(r => r.id !== id), { ...previous, ...payload, id: id || crypto.randomUUID(), submitted_at: previous?.submitted_at || new Date().toISOString(), updated_at: new Date().toISOString() }]); return;
  }
  const query = id ? supabase.from('rsvps').update(payload).eq('id', id) : supabase.from('rsvps').insert(payload);
  const { error } = await query; if (error) throw error;
}
export async function adminDelete(id) {
  if (demo) return writeDemo(readDemo().filter(r => r.id !== id));
  const { error } = await supabase.from('rsvps').delete().eq('id', id); if (error) throw error;
}
