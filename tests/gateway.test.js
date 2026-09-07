import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
test('public gateway requires valid origin, CAPTCHA and bounded payload before database writes',async()=>{
  let handler, rpcCalls=0, captchaSuccess=true, hostname='example.github.io';
  const env={ALLOWED_ORIGINS:'https://example.github.io',TURNSTILE_SECRET_KEY:'test-secret',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only'};
  const source=(await readFile(new URL('../supabase/functions/public-rsvp/index.ts',import.meta.url),'utf8')).replace("import { createClient } from 'npm:@supabase/supabase-js@2';",'');
  vm.runInNewContext(stripTypeScriptTypes(source),{
    Deno:{env:{get:k=>env[k]},serve:fn=>{handler=fn;}},Request,Response,TextEncoder,TextDecoder,URL,URLSearchParams,AbortSignal,crypto,
    fetch:async()=>new Response(JSON.stringify({success:captchaSuccess,hostname}),{headers:{'Content-Type':'application/json'}}),
    createClient:()=>({rpc:async(_name,args)=>{rpcCalls++;assert.match(args.receipt_hash,/^[a-f0-9]{64}$/);return{data:'saved-id',error:null};}}),
  });
  const payload={full_name:'Test Guest',host_side:'bride',guest_group:'ญาติ',attendance_status:'attending',guest_count:2};
  const body={payload,edit_token:'a'.repeat(64),captcha:'test-captcha'};
  const send=(value=body,origin='https://example.github.io')=>handler(new Request('https://api.example',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(value)}));
  assert.equal((await send(body,'https://evil.example')).status,403);
  assert.equal((await send({...body,captcha:''})).status,400);
  assert.equal((await send({...body,payload:{...payload,guest_count:1.5}})).status,400);
  assert.equal((await send({...body,payload:{...payload,remark:'x'.repeat(17000)}})).status,413);
  captchaSuccess=false;assert.equal((await send()).status,400);
  captchaSuccess=true;hostname='evil.example';assert.equal((await send()).status,400);
  assert.equal(rpcCalls,0);
  hostname='example.github.io';const result=await send();assert.equal(result.status,200);assert.equal((await result.json()).id,'saved-id');assert.equal(rpcCalls,1);
  delete env.TURNSTILE_SECRET_KEY;assert.equal((await send()).status,503);assert.equal(rpcCalls,1);
});
