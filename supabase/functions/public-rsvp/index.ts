// Public gateway: validates CAPTCHA and input before using the server-only RPC.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean);
  const headers = { 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : 'null', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin', 'Content-Type': 'application/json' };
  const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (!allowed.includes(origin)) return response({ error: 'Origin not allowed' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
  try {
    // Bound the stream itself; do not trust Content-Length from clients.
    const reader = req.body?.getReader();
    if (!reader) return response({ error: 'Missing body' }, 400);
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      bytes += value.length;
      if (bytes > 16000) { await reader.cancel(); return response({ error: 'Payload too large' }, 413); }
      chunks.push(value);
    }
    const joined = new Uint8Array(bytes); let offset=0;
    for (const part of chunks) { joined.set(part,offset); offset+=part.length; }
    const { payload, edit_token, captcha } = JSON.parse(new TextDecoder().decode(joined));
    if (!payload || typeof payload !== 'object' || typeof edit_token !== 'string' || !/^[a-f0-9]{64}$/.test(edit_token) || typeof captcha !== 'string' || !captcha || captcha.length > 2048) return response({error:'Invalid request'},400);
    const limits: Record<string,number> = { full_name:200,phone:50,email:254,host_side:10,guest_group:100,group_detail:200,remark:2000,attendance_status:10 };
    for (const [field,max] of Object.entries(limits)) if (payload[field] !== undefined && (typeof payload[field] !== 'string' || payload[field].length > max)) return response({error:'Invalid field'},400);
    if (!payload.full_name?.trim() || !['attending','declined'].includes(payload.attendance_status) || !['bride','groom','both','other'].includes(payload.host_side) || !['ญาติ','เพื่อนประถม','เพื่อนมัธยม','เพื่อนมหาวิทยาลัย','เพื่อนร่วมงาน','อื่น ๆ'].includes(payload.guest_group)) return response({error:'Invalid RSVP'},400);
    if (payload.attendance_status === 'declined') payload.guest_count = 0;
    else if (!Number.isInteger(payload.guest_count) || payload.guest_count < 1 || payload.guest_count > 100) return response({error:'Invalid count'},400);
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return response({error:'Invalid email'},400);
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!secret) return response({error:'RSVP not configured'},503);
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method:'POST', body: new URLSearchParams({secret,response:captcha}), signal:AbortSignal.timeout(10000) });
    const result = await verification.json();
    if (!verification.ok || !result.success || result.hostname !== new URL(origin).hostname) return response({error:'CAPTCHA verification failed'},400);
    const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(edit_token));
    const receipt_hash = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const db = createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error} = await db.rpc('submit_rsvp',{payload,receipt_hash});
    if (error) return response({error:'Could not save RSVP'},400);
    return response({id:data});
  } catch (error) {
    return response({error:error instanceof SyntaxError ? 'Invalid JSON' : 'Could not process RSVP'},error instanceof SyntaxError ? 400 : 500);
  }
});
