import { useEffect, useState } from 'react';
import weddingLogo from '../Logo.png';
import { ArrowDown, ArrowUpRight, CalendarDays, Check, Heart, MapPin, Menu, X, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { wedding as w } from './config';
import { demo, configured, submitRsvp, editToken, answerKey } from './api';
import { blankRsvp, download } from './domain';
import RsvpForm from './RsvpForm';
import Admin from './Admin';
import PreWeddingGallery from './PreWeddingGallery';
import { WeddingHero, Countdown, InvitationGallery, useWeddingMotion } from './WeddingExperience';

function Botanical({ className = '' }) {
  return <svg className={`botanical ${className}`} viewBox="0 0 300 450" fill="none" aria-hidden="true"><path d="M160 443C100 325 185 194 154 15M145 346C91 323 57 281 29 234M148 285C201 258 241 218 257 176M159 203C108 160 80 121 70 77M163 133C203 106 227 68 224 24" stroke="currentColor" strokeWidth="2"/>{[[125,320,-55],[75,280,-55],[38,238,-45],[180,259,45],[220,219,40],[251,179,30],[135,175,-50],[100,132,-40],[75,88,-30],[185,108,35],[214,63,25],[155,59,-10]].map(([x,y,r],i)=><ellipse key={i} cx={x} cy={y} rx="13" ry="33" transform={`rotate(${r} ${x} ${y})`} fill="currentColor" opacity={.22 + i % 3 * .13}/>)}</svg>;
}
function CalendarLink() {
  return <button className="text-link" onClick={() => {
    const stamp = date => new Date(date).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const escape = text => text.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
    download(['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding ECard//TH','BEGIN:VEVENT','UID:wedding-' + stamp(w.start) + '@ecard','DTSTAMP:' + stamp(new Date()),'DTSTART:' + stamp(w.start),...(w.end ? ['DTEND:' + stamp(w.end)] : []),'SUMMARY:' + escape(`งานแต่งงาน ${w.bride} & ${w.groom}`),'LOCATION:' + escape(w.venue + ' ' + w.address),'END:VEVENT','END:VCALENDAR'].join('\r\n') + '\r\n', 'wedding.ics', 'text/calendar;charset=utf-8');
  }}><CalendarDays size={16}/>บันทึกลงปฏิทิน</button>;
}
export default function App() {
  const [hash, setHash] = useState(location.hash), [menu, setMenu] = useState(false), [share, setShare] = useState(false), [copied,setCopied] = useState(false);
  const [answer, setAnswer] = useState(() => { try { return JSON.parse(localStorage.getItem(answerKey) || 'null'); } catch { return null; } });
  const [editing,setEditing] = useState(false);
  const progress = useWeddingMotion(hash);
  useEffect(() => { const listener = () => { setHash(location.hash); setMenu(false); }; window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange',listener); }, []);
  if (hash.startsWith('#/admin')) return <Admin/>;
  const url = location.origin + location.pathname;
  const unconfigured = !demo && !configured;
  return <>
    <div className="reading-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true"/>
    {demo && <div className="demo-banner">โหมดทดลอง · ข้อมูลบันทึกเฉพาะเบราว์เซอร์นี้ ยังไม่ส่งถึงผู้จัดงาน</div>}
    {w.isSample && <div className="sample-note">ตัวอย่างการ์ด · ชื่อ วัน และสถานที่ยังเป็นข้อมูลสาธิต</div>}
    <header className="site-header"><a className="wedding-wordmark" href="#home" aria-label={`${w.brideDisplay} และ ${w.groomDisplay} — กลับหน้าแรก`}><img className="wedding-logo" src={weddingLogo} width="64" height="64" alt=""/><span className="wedding-wordmark-copy"><strong>หนึ่งคำว่าเรา</strong><small>{w.dateEnglish}</small></span></a><button className="mobile-toggle" aria-label="เปิดเมนู" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button><nav className={menu ? 'open' : ''} onClick={e=>{if(e.target.closest('a'))setMenu(false);}}><a href="#story">คำเชิญจากเรา</a><a href="#invitation">การ์ดเชิญ</a><a href="#prewedding">Pre-wedding</a><a href="#details">รายละเอียดงาน</a><a href="#rsvp" className="nav-rsvp">ตอบรับคำเชิญ <ArrowUpRight size={14}/></a></nav></header>
    <main>
      <WeddingHero/>
      <Countdown/>
      <section id="details" className="mockup-details"><div className="section-heading"><div><div className="eyebrow">THE CELEBRATION</div><h2>นัดหมายแห่งความสุข</h2></div><span className="fine-print">เก็บวันนี้ไว้ให้เรานะ</span></div><div className="detail-grid"><article className="detail-card"><h3 className="mockup-day"><strong>{w.dateLabel.split(' ')[0]}</strong><span>{w.dateLabel.split(' ').slice(1).join(' ')}</span></h3><p>{w.timeLabel}</p><CalendarLink/></article><article className="detail-card"><MapPin/><h3>{w.venue}</h3><p>{w.address}</p>{w.mapUrl ? <a className="text-link" href={w.mapUrl} target="_blank" rel="noreferrer"><MapPin size={20}/>ดูแผนที่ <ArrowUpRight size={16}/></a> : <span className="fine-print">แผนที่จะพร้อมเมื่อยืนยันสถานที่</span>}</article><article className="detail-card"><Heart/><h3>Dress code</h3><p>{w.dressCodeLabel}</p><div className="swatches" aria-label={`Dress code ${w.dressCodeLabel}`}>{w.dressCode.map(c => <span key={c} style={{background:c}}/>)}</div></article></div><div className="schedule">{w.schedule.map((item,i)=><div className="schedule-item" key={item.time}><span className="schedule-number">0{i+1}</span><time>{item.time}</time><h3>{item.title}</h3><p>{item.detail}</p></div>)}</div></section>
      <section id="story" className="story section reveal">
        {['top-left','top-right','bottom-left','bottom-right'].map(corner => <Botanical key={corner} className={`note-corner ${corner}`}/>)}
        <div className="eyebrow">A LITTLE NOTE TO YOU</div>
        <div className="note-hearts" aria-hidden="true"><Heart/><Heart/></div>
        <h2>วันพิเศษของเรา<br/>จะสมบูรณ์ขึ้น เมื่อมีคุณ</h2>
        <div className="family-invitation">
          <div className="hosts">{w.hosts.map(host => <div key={host.name}><span>{host.name}</span><small>{host.role}</small></div>)}</div>
          <p className="invitation">{w.invitation}</p>
          <div className="note-divider" aria-hidden="true">❖</div>
          <p className="couple-full-names">{w.brideFullName}<br/><span>&</span><br/>{w.groomFullName}</p>
          <div className="note-divider" aria-hidden="true">❖</div>
        </div>
        <p className="fine-print invitation-note">{w.invitationNote}</p>
      </section>
      <PreWeddingGallery/>
      <InvitationGallery/>
      <section id="rsvp" className="rsvp-section section reveal"><div className="rsvp-intro"><div className="eyebrow">KINDLY RSVP</div><h2>แล้วพบกัน<br/><em>ในวันของเรา</em></h2><p>บอกให้เรารู้ว่าคุณจะมาร่วมฉลองด้วยกันไหม<br/>เพื่อให้เราเตรียมต้อนรับคุณได้อย่างดีที่สุด</p><Botanical/><span className="fine-print">ใช้เวลาประมาณ 1 นาทีในการตอบรับ</span></div><div className="form-card">{unconfigured ? <div className="empty-state"><Heart/><h3>เตรียมพบกันเร็ว ๆ นี้</h3><p>ระบบยังไม่เปิดรับ RSVP กรุณาติดต่อบ่าวสาว</p></div> : answer && !editing ? <div className="success" role="status"><span className="success-icon"><Check size={30}/></span><div className="eyebrow">WITH LOVE & THANKS</div><h3>ขอบคุณ คุณ{answer.full_name}</h3><p>{answer.attendance_status === 'attending' ? `เรารอพบคุณและคนสำคัญ รวม ${answer.guest_count} คน` : 'ได้รับคำตอบแล้ว ขอบคุณที่ส่งความยินดีมาให้เรา'}</p>{demo && <p className="privacy">นี่คือคำตอบทดลอง ยังไม่ส่งถึงผู้จัดงาน</p>}<button className="button secondary" onClick={() => setEditing(true)}>แก้ไขคำตอบ</button><p className="fine-print">กลับมาแก้ไขได้จากเบราว์เซอร์นี้<br/>อย่าล้างข้อมูลเว็บไซต์หากต้องการแก้ไขภายหลัง</p></div> : <><div className="form-heading"><span>ตอบรับคำเชิญ</span><small>RSVP</small></div><RsvpForm initial={answer || blankRsvp} onSubmit={async (data,captcha) => { await submitRsvp(data, editToken(), captcha); try { localStorage.setItem(answerKey, JSON.stringify(data)); } catch { /* A successful remote save must still be acknowledged. */ } setAnswer(data); setEditing(false); }}/></>}</div></section>
      <section className="closing"><Heart size={23} strokeWidth={1}/><h2>Can't wait to celebrate with you.</h2><p>ขอบคุณที่เป็นส่วนหนึ่งของความทรงจำดี ๆ ของเรา</p><button className="text-link" onClick={() => setShare(true)}><QrCode size={17}/>แชร์การ์ดเชิญ</button></section>
    </main><footer><span>{w.brideDisplay} & {w.groomDisplay} · {w.dateEnglish}</span>{w.contactUrl && <a href={w.contactUrl} rel="noreferrer">{w.contactLabel}</a>}<a href="#/admin">สำหรับผู้จัดงาน <ArrowUpRight size={13}/></a></footer>
    {share && <div className="modal-backdrop" onClick={() => setShare(false)}><section className="share-modal" role="dialog" aria-modal="true" aria-label="แชร์คำเชิญ" onClick={e => e.stopPropagation()}><button className="close-modal" autoFocus aria-label="ปิด" onClick={() => setShare(false)}><X/></button><div className="eyebrow">YOU'RE INVITED</div><h2>{w.brideDisplay} & {w.groomDisplay}</h2><QRCodeSVG value={url} size={200} marginSize={4} fgColor="#806332"/><p>สแกนเพื่อเปิดการ์ดและตอบรับคำเชิญ</p><button className="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setCopied(false); } }}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</button><input aria-label="ลิงก์คำเชิญ" readOnly value={url} onFocus={e=>e.target.select()}/></section></div>}
  </>;
}
