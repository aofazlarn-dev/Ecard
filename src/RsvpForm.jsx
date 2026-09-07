import { useEffect, useRef, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { blankRsvp, sides, groups, normalizeRsvp } from './domain';
import { demo } from './api';

function Captcha({ onToken, resetKey }) {
  const container = useRef(null);
  useEffect(() => {
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!sitekey) return;
    let widget, disposed = false;
    const render = () => { if (!disposed && window.turnstile) widget = window.turnstile.render(container.current, { sitekey, callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken('') }); };
    let script = document.querySelector('#turnstile-script');
    if (window.turnstile) render();
    else {
      if (!script) { script = document.createElement('script'); script.id = 'turnstile-script'; script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; document.head.appendChild(script); }
      script.addEventListener('load', render);
    }
    return () => { disposed = true; script?.removeEventListener('load', render); if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [onToken, resetKey]);
  return <div ref={container} className="captcha" />;
}
export default function RsvpForm({ initial = blankRsvp, onSubmit, admin = false, onCancel }) {
  const [data, setData] = useState({ ...blankRsvp, ...initial });
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [captcha, setCaptcha] = useState(''), [resetKey, setResetKey] = useState(0);
  const change = e => setData(current => ({ ...current, [e.target.name]: e.target.value }));
  const field = (name, label, type = 'text', maxLength = 200) => <label>{label}<input name={name} type={type} value={data[name] || ''} onChange={change} required={name === 'full_name'} maxLength={maxLength} autoComplete={name === 'full_name' ? 'name' : name === 'phone' ? 'tel' : name === 'email' ? 'email' : 'off'}/></label>;
  async function submit(e) {
    e.preventDefault(); if (busy) return; setError('');
    try {
      const payload = normalizeRsvp(data);
      if (!admin && !demo && !captcha) throw new Error('กรุณายืนยันการตรวจสอบก่อนส่งคำตอบ');
      setBusy(true); await onSubmit(payload, captcha);
    } catch (err) { setError(err.message || 'บันทึกไม่สำเร็จ กรุณาลองใหม่'); }
    finally { setBusy(false); setCaptcha(''); setResetKey(k => k + 1); }
  }
  return <form onSubmit={submit} className="rsvp-form">
    <fieldset disabled={busy}><legend className="sr-only">ข้อมูลการตอบรับ</legend>
      {field('full_name', 'ชื่อ–นามสกุล *')}
      <fieldset className="attendance"><legend>มาร่วมวันสำคัญกับเราได้ไหม *</legend>
        {[['attending', 'ยินดีไปร่วมงาน', 'แล้วพบกันนะ'], ['declined', 'ไม่สะดวกไปร่วมงาน', 'ส่งความยินดีจากทางนี้']].map(([value, title, detail]) => <label key={value} className={data.attendance_status === value ? 'choice selected' : 'choice'}><input type="radio" name="attendance_status" value={value} checked={data.attendance_status === value} onChange={change}/><span><strong>{title}</strong><small>{detail}</small></span>{data.attendance_status === value && <Check size={18}/>}</label>)}
      </fieldset>
      <div className="form-grid"><label>ฝั่งเจ้าภาพ *<select name="host_side" value={data.host_side} onChange={change} required><option value="">เลือกฝั่งเจ้าภาพ</option>{Object.entries(sides).map(([k,v]) => <option value={k} key={k}>{v}</option>)}</select></label>
      <label>กลุ่มแขก *<select name="guest_group" value={data.guest_group} onChange={change} required><option value="">เลือกกลุ่มของคุณ</option>{groups.map(g => <option key={g}>{g}</option>)}</select></label></div>
      {field('group_detail', 'ชื่อกลุ่ม / รายละเอียดเพิ่มเติม')}
      {data.attendance_status === 'attending' && <label>จำนวนผู้เข้าร่วมทั้งหมด (รวมตัวคุณ) *<input name="guest_count" type="number" min="1" max="100" step="1" required value={data.guest_count} onChange={change}/></label>}
      <div className="form-grid">{field('phone', 'เบอร์โทรศัพท์ (ไม่บังคับ)', 'tel', 50)}{field('email', 'อีเมล (ไม่บังคับ)', 'email', 254)}</div>
      <label>ฝากข้อความถึงเรา<textarea name="remark" rows="3" maxLength="2000" value={data.remark || ''} onChange={change} placeholder="คำอวยพร อาหารที่แพ้ หรือสิ่งที่อยากให้เราช่วยดูแล"/></label>
      {!admin && <p className="privacy">ข้อมูลนี้ใช้สำหรับจัดงานและติดต่อเรื่องการเข้าร่วมงานเท่านั้น ผู้จัดงานเป็นผู้เข้าถึงข้อมูล</p>}
      {!admin && !demo && <Captcha onToken={setCaptcha} resetKey={resetKey}/>}
      {error && <p role="alert" className="error">{error}</p>}
      <div className="form-actions">{onCancel && <button type="button" className="button secondary" onClick={onCancel}>ยกเลิก</button>}<button className="button" type="submit" disabled={busy}>{busy ? 'กำลังบันทึก…' : admin ? 'บันทึกข้อมูล' : 'ยืนยันการตอบรับ'}<ArrowRight size={17}/></button></div>
    </fieldset>
  </form>;
}
