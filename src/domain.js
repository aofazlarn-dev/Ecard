export const sides = { bride: 'ฝั่งเจ้าสาว', groom: 'ฝั่งเจ้าบ่าว', both: 'ทั้งสองฝ่าย', other: 'อื่น ๆ' };
export const groups = ['ญาติ', 'เพื่อนประถม', 'เพื่อนมัธยม', 'เพื่อนมหาวิทยาลัย', 'เพื่อนร่วมงาน', 'อื่น ๆ'];
export const blankRsvp = { full_name: '', phone: '', email: '', attendance_status: 'attending', host_side: '', guest_group: '', group_detail: '', guest_count: 1, remark: '' };
export function normalizeRsvp(input) {
  const data = Object.fromEntries(Object.keys(blankRsvp).map(key => [key, typeof input[key] === 'string' ? input[key].trim() : input[key]]));
  data.guest_count = data.attendance_status === 'declined' ? 0 : Number(data.guest_count);
  if (!data.full_name || data.full_name.length > 200) throw new Error('กรุณาระบุชื่อไม่เกิน 200 ตัวอักษร');
  if (!['attending', 'declined'].includes(data.attendance_status)) throw new Error('กรุณาเลือกสถานะการเข้าร่วม');
  if (!Object.hasOwn(sides, data.host_side)) throw new Error('กรุณาเลือกฝั่งเจ้าภาพ');
  if (!groups.includes(data.guest_group)) throw new Error('กรุณาเลือกกลุ่มแขก');
  if (!Number.isInteger(data.guest_count) || data.guest_count < 0 || data.guest_count > 100 || (data.attendance_status === 'attending' && data.guest_count < 1)) throw new Error('จำนวนผู้เข้าร่วมต้องเป็นจำนวนเต็ม 1–100 คน');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('กรุณาตรวจสอบอีเมล');
  for (const [key, max] of Object.entries({ phone: 50, email: 254, group_detail: 200, remark: 2000 })) if ((data[key] || '').length > max) throw new Error('ข้อความยาวเกินกำหนด');
  return data;
}
export function summarize(rows) {
  const attending = rows.filter(r => r.attendance_status === 'attending');
  const count = list => list.reduce((sum, r) => sum + Number(r.guest_count), 0);
  return { total: rows.length, attending: attending.length, declined: rows.length - attending.length, people: count(attending), sides: Object.entries(sides).map(([key, label]) => ({ label, count: count(attending.filter(r => r.host_side === key)) })), groups: groups.map(label => ({ label, count: count(attending.filter(r => r.guest_group === label)) })) };
}
export function csv(rows) {
  const columns = { full_name: 'ชื่อ-นามสกุล', attendance_status: 'สถานะ', host_side: 'ฝั่งเจ้าภาพ', guest_group: 'กลุ่มแขก', group_detail: 'รายละเอียดกลุ่ม', guest_count: 'จำนวนคน', phone: 'โทรศัพท์', email: 'อีเมล', remark: 'หมายเหตุ', updated_at: 'แก้ไขล่าสุด' };
  const escape = value => { let s = String(value ?? ''); if (/^[\s]*[=+@-]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
  return '\uFEFF' + [Object.values(columns), ...rows.map(r => Object.keys(columns).map(k => k === 'host_side' ? sides[r[k]] : k === 'attendance_status' ? (r[k] === 'attending' ? 'เข้าร่วม' : 'ไม่เข้าร่วม') : r[k]))].map(row => row.map(escape).join(',')).join('\r\n');
}
export function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
