import { useEffect, useState } from 'react';
import weddingLogo from '../Logo.png';
import { ArrowDown, ArrowUpRight, CalendarDays, Check, Heart, MapPin, Menu, X, Copy, QrCode, Leaf, Gem, HandHeart, Droplets } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { wedding as w } from './config';
import { demo, configured, submitRsvp, editToken, answerKey } from './api';
import { blankRsvp, download } from './domain';
import RsvpForm from './RsvpForm';
import Admin from './Admin';
import PreWeddingGallery from './PreWeddingGallery';
import { OpeningExperience, WeddingHero, Countdown, InvitationGallery, useWeddingMotion } from './WeddingExperience';

function WaiIcon({ size = 25, strokeWidth = 1.2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v11M12 3c-1-1-2 0-2 1L8.5 11 6 14l4 5 2-5M12 3c1-1 2 0 2 1l1.5 7 2.5 3-4 5-2-5M6 14l-3 3 5 5 2-3M18 14l3 3-5 5-2-3"/><path d="m8.5 11 1 3m6-3-1 3"/></svg>;
}
function OfferingTrayIcon({ size = 25, strokeWidth = 1.2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18c-1 4-4 5-9 5s-8-1-9-5ZM10 17v3m4-3v3m-7 2h10l-3-2h-4l-3 2Z"/><circle cx="9" cy="8" r="3"/><circle cx="15" cy="8" r="3"/><path d="m12 3 2-2 2 2-2 2-2-2ZM2 12h20"/></svg>;
}
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
    <OpeningExperience/>
    <div className="reading-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true"/>
    {demo && <div className="demo-banner">โหมดทดลอง · ข้อมูลบันทึกเฉพาะเบราว์เซอร์นี้ ยังไม่ส่งถึงผู้จัดงาน</div>}
    {w.isSample && <div className="sample-note">ตัวอย่างการ์ด · ชื่อ วัน และสถานที่ยังเป็นข้อมูลสาธิต</div>}
    <header className="site-header"><a className="wedding-wordmark" href="#home" aria-label={`${w.brideDisplay} และ ${w.groomDisplay} — กลับหน้าแรก`}><img className="wedding-logo" src={weddingLogo} width="64" height="64" alt=""/><span className="wedding-wordmark-copy"><strong>หนึ่งคำว่าเรา</strong><small>{w.dateEnglish}</small></span></a><button className="mobile-toggle" aria-label="เปิดเมนู" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button><nav className={menu ? 'open' : ''} onClick={e=>{if(e.target.closest('a'))setMenu(false);}}><a href="#story">คำเชิญจากเรา</a><a href="#invitation">การ์ดเชิญ</a><a href="#prewedding">Pre-wedding</a><a href="#details">รายละเอียดงาน</a><a href="#rsvp" className="nav-rsvp">ตอบรับคำเชิญ <ArrowUpRight size={14}/></a></nav></header>
    <main>
      <WeddingHero/>
      <Countdown/>
      <section id="details" className="mockup-details">
        <div className="section-heading"><div><div className="celebration-ornament" aria-hidden="true"><Leaf size={24}/></div><h2>นัดหมายแห่งความสุข</h2><p className="celebration-caption">ร่วมเป็นส่วนหนึ่งในวันสำคัญของเรา</p></div></div>
        <div className="detail-grid">
          <article className="detail-card"><h3 className="mockup-day"><strong>{w.dateLabel.split(' ')[0]}</strong><span>{w.dateLabel.split(' ').slice(1).join(' ')}</span></h3><p>{w.timeLabel}</p></article>
          <article className="detail-card"><div className="venue-title"><MapPin size={24}/><h3>{w.venue}</h3></div><p>{w.address}</p><div className="venue-actions"><CalendarLink/>{w.mapUrl && <a className="text-link" href={w.mapUrl} target="_blank" rel="noreferrer"><MapPin size={20}/>ดูแผนที่</a>}</div></article>
        </div>
        <div className="schedule">{w.schedule.map((item,i)=>{const Icon = [WaiIcon, OfferingTrayIcon, Gem, HandHeart, Droplets][i] || Heart; return <div className="schedule-item" key={item.time}><span className="ceremony-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.2}/></span><time>{item.time}</time><h3>{item.title}</h3><p>{item.detail}</p></div>;})}</div>
        <div className="dress-editorial"><h3>DRESS CODE</h3><div className="dress-colors" aria-label={w.dressCodeLabel}>{w.dressCode.map((c,i)=><div key={c}><span style={{background:c}}/><small>{w.dressCodeLabel.split(' · ')[i]}</small></div>)}</div><p>อบอุ่น เรียบง่าย ไปด้วยกัน</p></div>
      </section>
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
