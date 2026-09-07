import test from 'node:test';
import assert from 'node:assert/strict';
import { blankRsvp, normalizeRsvp, summarize, csv } from '../src/domain.js';
const valid = {...blankRsvp,full_name:' แขกทดสอบ ',host_side:'bride',guest_group:'ญาติ',guest_count:2};
test('declining resets attendees to zero even if form held a previous count',()=>{
  const data=normalizeRsvp({...valid,attendance_status:'declined',guest_count:8});
  assert.equal(data.guest_count,0);assert.equal(data.full_name,'แขกทดสอบ');
});
test('invalid counts, status, sides, groups and oversized text are rejected',()=>{
  for(const guest_count of [0,-1,1.5,101,'NaN']) assert.throws(()=>normalizeRsvp({...valid,guest_count}));
  for(const [key,value] of [['attendance_status','unknown'],['host_side','__proto__'],['guest_group','bad'],['full_name',' '],['email','no-at'],['remark','a'.repeat(2001)]]) assert.throws(()=>normalizeRsvp({...valid,[key]:value}));
});
test('summary counts people independently from response records',()=>{
  const s=summarize([normalizeRsvp(valid),normalizeRsvp({...valid,host_side:'groom',guest_count:3}),normalizeRsvp({...valid,attendance_status:'declined'})]);
  assert.equal(s.people,5);assert.equal(s.total,3);assert.equal(s.attending,2);assert.equal(s.declined,1);assert.equal(s.sides[0].count,2);assert.equal(s.groups[0].count,5);
});
test('CSV preserves Thai, quotes and multiline values and neutralizes formulas',()=>{
  const output=csv([{...valid,full_name:'=HYPERLINK("bad")',remark:'a,"b"\nc'}]);
  assert.ok(output.startsWith('\uFEFF'));assert.ok(output.includes("\"'=HYPERLINK(\"\"bad\"\")\""));assert.ok(output.includes('"a,""b""\nc"'));
});
