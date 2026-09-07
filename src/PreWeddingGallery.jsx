import { useEffect, useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Heart, Maximize2, X } from 'lucide-react';
import { preWeddingPhotos as photos } from './preWeddingPhotos';
import './prewedding.css';

function Photo({ photo, ...props }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="photo-unavailable" role="img" aria-label={photo.alt}><Camera size={26}/><span>ไม่สามารถโหลดภาพนี้ได้</span></span>
    : <img src={photo.src} alt={photo.alt} onError={() => setFailed(true)} {...props}/>;
}

export default function PreWeddingGallery() {
  const [visible, setVisible] = useState(6), [selected, setSelected] = useState(null);
  const dialog = useRef(null), opener = useRef(null), touch = useRef(null);
  const current = selected === null ? null : photos[selected];
  const move = delta => setSelected(index => index === null || !photos.length ? null : (index + delta + photos.length) % photos.length);
  useEffect(() => {
    if (selected !== null && !dialog.current.open) {
      opener.current = document.activeElement;
      dialog.current.showModal();
    } else if (selected === null && dialog.current.open) {
      dialog.current.close();
      opener.current?.focus();
    }
  }, [selected]);
  useEffect(() => {
    if (selected === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selected]);
  return <section id="prewedding" className="prewedding-section section reveal" aria-labelledby="prewedding-title">
    <div className="gallery-heading"><div className="eyebrow">OUR LOVE, THROUGH THE LENS</div><h2 id="prewedding-title">ภาพของเรา เรื่องราวของความรัก</h2><p>เก็บรอยยิ้มและช่วงเวลาที่มีความหมาย<br className="mobile-break"/> ก่อนเริ่มต้นบทใหม่ไปด้วยกัน</p></div>
    {photos.length ? <>
      <div className="prewedding-grid">{photos.slice(0, visible).map((photo, index) => <button className="prewedding-photo" key={photo.id} onClick={() => setSelected(index)} aria-label={`ขยายภาพพรีเวดดิ้ง ${index + 1}`}><Photo photo={photo} loading="lazy" decoding="async"/><span className="prewedding-photo-overlay"><span>{String(index + 1).padStart(2, '0')}</span><Maximize2 size={18}/></span></button>)}</div>
      <div className="prewedding-actions"><span className="fine-print">{Math.min(visible, photos.length)} / {photos.length} ภาพ</span>{visible < photos.length && <button className="button secondary" onClick={() => setVisible(n => n + 6)}>ชมภาพเพิ่มเติม <ChevronRight size={16}/></button>}</div>
    </> : <div className="prewedding-coming-soon"><div className="photo-frame-decoration" aria-hidden="true"><Camera size={31} strokeWidth={1}/><Heart size={15} strokeWidth={1}/></div><span className="eyebrow">PRE-WEDDING GALLERY</span><h3>ความทรงจำของเรา…เร็ว ๆ นี้</h3><p>เรากำลังเตรียมภาพช่วงเวลาพิเศษ<br/>ไว้แบ่งปันให้คนสำคัญได้ชมกัน</p><span className="coming-soon-seal">WITH LOVE · COMING SOON</span></div>}
    <dialog ref={dialog} className="card-lightbox prewedding-lightbox" aria-label="ชมภาพพรีเวดดิ้ง" onCancel={e => { e.preventDefault(); setSelected(null); }} onClick={e => { if (e.target === dialog.current) setSelected(null); }} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } }}>
      <div className="lightbox-toolbar"><div><span className="eyebrow">OUR PRE-WEDDING</span><p>ช่วงเวลาของเราสองคน</p></div><div><button autoFocus aria-label="ปิดภาพพรีเวดดิ้ง" onClick={() => setSelected(null)}><X/></button></div></div>
      <div className="prewedding-full-image" onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }} onTouchEnd={e => { if (!touch.current || !e.changedTouches.length) return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; touch.current = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1); }} onTouchCancel={() => { touch.current = null; }}>
        {current && <Photo key={current.id} photo={current}/>}
      </div>
      <div className="lightbox-navigation"><button className="text-link" aria-label="ภาพก่อนหน้า" disabled={photos.length < 2} onClick={() => move(-1)}><ChevronLeft size={20}/>ก่อนหน้า</button><span className="prewedding-counter" role="status" aria-live="polite">{selected === null ? 0 : selected + 1} / {photos.length}</span><button className="text-link" aria-label="ภาพถัดไป" disabled={photos.length < 2} onClick={() => move(1)}>ถัดไป<ChevronRight size={20}/></button></div>
    </dialog>
  </section>;
}
