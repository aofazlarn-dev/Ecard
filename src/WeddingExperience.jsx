import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Download, Heart, Maximize2, Sparkles, X, ZoomIn, ZoomOut } from 'lucide-react';
import { wedding as w } from './config';

export const asset = name => `${import.meta.env.BASE_URL}images/${name}`;

export function WeddingHero() {
  return <section className="hero editorial-hero" id="home">
    <div className="gold-orbit orbit-one" aria-hidden="true"/><div className="gold-orbit orbit-two" aria-hidden="true"/>
    <div className="hero-inner">
      <div className="eyebrow"><span className="tiny-star">✦</span> THE BEGINNING OF FOREVER</div>
      <p className="hero-prelude">คำเชิญสู่วันสำคัญของเราสองคน</p>
      <h1>{w.brideDisplay}<span>&</span>{w.groomDisplay}</h1>
      <p className="hero-poem">หนึ่งคำว่าเรา…กับเรื่องราวอีกตลอดไป</p>
      <div className="hero-rule"/>
      <p className="hero-date">{w.dateEnglish}</p>
      <p className="hero-location">{w.venue}<br/>{w.city}</p>
      <div className="hero-actions"><a href="#rsvp" className="button">ตอบรับคำเชิญ <ArrowUpRight size={17}/></a><a className="text-link" href="#invitation">ชมการ์ดของเรา <ArrowDown size={15}/></a></div>
    </div>
    <div className="hero-art" aria-label="ภาพคู่บ่าวสาว">
      <div className="arch-outline" aria-hidden="true"/>
      <div className="portrait-arch"><img src={asset('couple-ivory.webp')} width="1068" height="1473" alt="ภาพการ์ตูนคู่บ่าวสาวจากแบบการ์ดเชิญ" fetchPriority="high"/></div>
      <div className="hero-card" aria-hidden="true"><img src={asset('card-front.webp')} width="1571" height="2171" alt=""/></div>
      <span className="art-sparkle sparkle-one" aria-hidden="true">✧</span><span className="art-sparkle sparkle-two" aria-hidden="true">✦</span>
      <div className="wedding-seal" aria-hidden="true"><span>WITH LOVE</span><Heart size={23} strokeWidth={1}/><small>28 · 11 · 2026</small></div>
      <div className="art-caption"><span>YOU & ME</span><i>and a lifetime of love.</i></div>
    </div>
    <div className="hero-bottom"><span>A BEAUTIFUL DAY. OUR FOREVER STORY.</span><a href="#story">เลื่อนเพื่ออ่านคำเชิญ <ArrowDown size={13}/></a></div>
  </section>;
}

export function Countdown() {
  const [now,setNow] = useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const remaining=Math.max(0,Math.floor((new Date(w.start).getTime()-now)/1000));
  const values=[Math.floor(remaining/86400),Math.floor(remaining%86400/3600),Math.floor(remaining%3600/60),remaining%60];
  return <section className="countdown-band" aria-label="นับถอยหลังถึงวันงาน"><div className="countdown-note"><Sparkles size={20} strokeWidth={1}/><div><span className="eyebrow">COUNTING EVERY MOMENT</span><p>{remaining ? 'อีกไม่นาน…เราจะได้พบกัน' : 'ขอบคุณที่เป็นส่วนหนึ่งในวันของเรา'}</p></div></div><div className="countdown-digits" aria-live="off">{values.map((value,i)=><div className="countdown-unit" key={i}><strong>{String(value).padStart(2,'0')}</strong><span>{['วัน','ชั่วโมง','นาที','วินาที'][i]}</span></div>)}</div></section>;
}

const cards=[
  {src:'card-front.webp',title:'คำเชิญจากครอบครัว',description:'ชื่อเจ้าภาพและกำหนดพิธีมงคลสมรส',label:'ด้านหน้า',index:'01'},
  {src:'card-back.webp',title:'วันของเรา สถานที่ของความทรงจำ',description:'ภาพคู่บ่าวสาวและแผนที่เดินทาง',label:'ด้านหลัง',index:'02'},
];
export function InvitationGallery() {
  const [selected,setSelected]=useState(null),[zoom,setZoom]=useState(false);
  const dialog=useRef(null),returnFocus=useRef(null),scroller=useRef(null);
  useEffect(()=>{
    if(selected!==null){if(!dialog.current.open){returnFocus.current=document.activeElement;dialog.current.showModal();}}
    else if(dialog.current.open){dialog.current.close();returnFocus.current?.focus();}
    setZoom(false);scroller.current?.scrollTo(0,0);
  },[selected]);
  useEffect(()=>{
    if(selected===null)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;};
  },[selected]);
  const close=()=>setSelected(null);
  const current=cards[selected??0];
  return <section className="invitation-gallery section reveal" id="invitation">
    <div className="gallery-heading"><div className="eyebrow">A LETTER, SEALED WITH LOVE</div><h2>การ์ดใบนี้…ส่งถึงคุณ</h2><p>ทุกตัวอักษรคือความตั้งใจ<br className="mobile-break"/> และทุกคำเชิญคือคนสำคัญของเรา</p></div>
    <div className="invitation-pair">{cards.map((card,i)=><figure className="invitation-piece" key={card.src}><div className="card-meta"><span>THE INVITATION</span><span>{card.index} / 02</span></div><button className="card-image-button" aria-label={`ขยายการ์ด${card.label}`} onClick={()=>setSelected(i)}><img src={asset(card.src)} alt={`การ์ดเชิญ${card.label} — ${card.description}`} width="1571" height="2171" loading="lazy"/><span className="card-zoom"><Maximize2 size={16}/>แตะเพื่ออ่านการ์ด</span></button><figcaption><span>{card.label}</span><h3>{card.title}</h3><p>{card.description}</p></figcaption></figure>)}</div>
    <div className="gallery-footer"><span><Heart size={15} strokeWidth={1}/>เก็บคำเชิญนี้ไว้ แล้วมาพบกันนะ</span><a className="button secondary" href={asset('wedding-invitation.pdf')} download="wedding-invitation.pdf"><Download size={16}/>ดาวน์โหลดการ์ดทั้ง 2 หน้า</a></div>
    <dialog ref={dialog} className="card-lightbox" aria-label="ชมการ์ดเชิญฉบับเต็ม" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===dialog.current)close();}} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();setSelected(n=>n===0?1:0);}}}>
      <div className="lightbox-toolbar"><div><span className="eyebrow">THE INVITATION</span><p>การ์ด{current.label} <small>{(selected??0)+1} / 2</small></p></div><div><button aria-label={zoom?'ย่อการ์ด':'ซูมการ์ด'} onClick={()=>setZoom(z=>!z)}>{zoom?<ZoomOut/>:<ZoomIn/>}</button><button autoFocus aria-label="ปิดการ์ด" onClick={close}><X/></button></div></div>
      <div className={`lightbox-scroll ${zoom?'zoomed':''}`} ref={scroller}><img src={asset(current.src)} alt={`การ์ดเชิญ${current.label}ฉบับเต็ม`} width="1571" height="2171"/></div>
      <div className="lightbox-navigation"><button className="text-link" onClick={()=>setSelected(n=>n===0?1:0)}><ChevronLeft size={18}/>อีกด้านของการ์ด</button><span>{current.title}</span><button className="text-link" aria-label="ดูการ์ดอีกด้าน" onClick={()=>setSelected(n=>n===0?1:0)}><ChevronRight size={18}/></button></div>
    </dialog>
  </section>;
}

export function useWeddingMotion(hash) {
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    if(hash.startsWith('#/admin'))return;
    const nodes=[...document.querySelectorAll('.reveal')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer;
    if(!reduced && 'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');observer.unobserve(entry.target);}}),{threshold:0.05});
      nodes.forEach(node=>{node.classList.add('reveal-pending');observer.observe(node);});
    }
    let frame;
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const range=document.documentElement.scrollHeight-innerHeight;setProgress(range>0?scrollY/range:0);});};
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    return()=>{observer?.disconnect();nodes.forEach(node=>node.classList.remove('reveal-pending'));window.removeEventListener('scroll',update);window.removeEventListener('resize',update);cancelAnimationFrame(frame);};
  },[hash.startsWith('#/admin')]);
  return progress;
}
