import { useEffect, useState } from 'react';
import { listRsvps, listTables, placeTable } from './api';
import './seating.css';

export default function TableLayout() {
  const [tables, setTables] = useState([]), [rows, setRows] = useState([]), [selected, setSelected] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function load() { const [t, r] = await Promise.all([listTables(), listRsvps()]); setTables(t); setRows(r); }
  useEffect(() => { load().catch(() => setError('โหลดผังไม่สำเร็จ กรุณาลองใหม่')); }, []);
  async function move(id, slot) {
    setBusy(true); setError('');
    try { await placeTable(id, slot); await load(); setSelected(id); }
    catch { setError('บันทึกตำแหน่งไม่สำเร็จ ตำแหน่งอาจถูกใช้งานแล้ว กรุณาลองใหม่'); await load().catch(() => {}); }
    finally { setBusy(false); }
  }
  const current = tables.find(t => t.id === selected);
  const guests = rows.filter(r => r.table_id === selected && r.attendance_status === 'attending');
  return <main className="admin-main layout-page"><div className="admin-title"><div><div className="eyebrow">WEDDING FLOOR PLAN</div><h1>ผังจัดโต๊ะ</h1><p>เลือกโต๊ะ แล้วกดตำแหน่งว่างบนผังเพื่อจัดวางหรือย้ายโต๊ะ</p></div><a className="button secondary" href="#/admin/tables">กลับหน้าจัดการโต๊ะ</a></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="layout-columns"><section className="layout-plan-card"><div className="layout-caption"><strong>ผังงานจำลอง</strong><span>พื้นที่อ้างอิง 20 × 25 เมตร</span></div><div className="layout-plan"><div className="layout-stage"><span>✦</span><strong>เวที</strong><small>8 × 4 เมตร</small></div><div className="layout-ceremony"><span>พื้นที่พระสงฆ์</span><span>พื้นที่รดน้ำสังข์</span></div><div className="layout-grid">{Array.from({length: 24}, (_, index) => { const slot = index + 1, table = tables.find(t => t.layout_slot === slot), count = table ? rows.filter(r => r.table_id === table.id && r.attendance_status === 'attending').reduce((sum, r) => sum + r.guest_count, 0) : 0; return <button key={slot} type="button" disabled={busy || (!table && !current)} className={`layout-slot ${table ? 'occupied' : 'vacant'} ${table?.id === selected ? 'selected' : ''}`} aria-label={table ? `${table.name} ${count} คน` : `ตำแหน่งว่าง ${slot}`} onClick={() => table ? setSelected(table.id) : move(selected, slot)}>{table ? <><strong>{table.name}</strong><small>{count} คน</small></> : <span>＋</span>}</button>; })}<div className="layout-aisle">ทางเดินกลาง</div></div><div className="layout-entry"><span>โต๊ะลงทะเบียน</span><strong>ทางเข้า</strong><span>ซุ้มถ่ายรูป</span></div></div><p className="fine-print">ผังนี้เป็นภาพจำลองตามภาพอ้างอิง ไม่ได้คำนวณระยะจริง</p></section>
    <aside className="layout-sidebar"><section className="summary-card"><h2>เลือกโต๊ะ ({tables.length})</h2>{tables.length ? <div className="layout-table-list">{tables.map(t => <button type="button" key={t.id} className={selected === t.id ? 'active' : ''} onClick={() => setSelected(t.id)}><span>{t.name}</span><small>{t.layout_slot ? `ตำแหน่ง ${t.layout_slot}` : 'ยังไม่วาง'}</small></button>)}</div> : <p>ยังไม่มีโต๊ะ เพิ่มโต๊ะจากหน้าจัดการโต๊ะก่อน</p>}</section>{current && <section className="summary-card"><h2>{current.name}</h2><p>{guests.reduce((sum, r) => sum + r.guest_count, 0)} คน · {guests.length} รายการ</p>{guests.length ? <ul>{guests.map(g => <li key={g.id}>{g.full_name} <small>({g.guest_count} คน)</small></li>)}</ul> : <p>ยังไม่มีแขกในโต๊ะนี้</p>}{current.layout_slot && <button className="text-link" disabled={busy} onClick={() => move(current.id, null)}>นำออกจากผัง</button>}</section>}</aside></div></main>;
}

