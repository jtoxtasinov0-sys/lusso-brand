import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { parseFrame, buildFrame, frameStyle } from '../framing';

// Rasmni ramkaga qo'lda joylashtirish: sudrab surish + kattalik slayderi.
// Ramka nisbati mini-ilovadagi mahsulot kartasi bilan bir xil (4:5).
export default function FrameEditor({ url, onSave, onClose }) {
  const init = parseFrame(url);
  const [f, setF] = useState({ z: init.z, x: init.x, y: init.y, fit: init.fit });
  const drag = useRef(null);
  const frameRef = useRef(null);

  const preview = buildFrame(init.src, f);

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: f.x, y: f.y };
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const r = frameRef.current.getBoundingClientRect();
    // Rasm barmoq ortidan yuradi: o'ngga sursangiz chap qismi ko'rinadi
    const k = 100 / Math.max(f.z, 1);
    const clamp = (n) => Math.max(0, Math.min(100, n));
    setF((s) => ({
      ...s,
      x: clamp(d.x - ((e.clientX - d.px) / r.width) * k),
      y: clamp(d.y - ((e.clientY - d.py) / r.height) * k),
    }));
  };

  const onUp = () => {
    drag.current = null;
  };

  const onWheel = (e) => {
    setF((s) => ({ ...s, z: Math.max(0.5, Math.min(3, s.z - e.deltaY * 0.002)) }));
  };

  // Mahsulot oynasi ichidan ochiladi — body ga chiqaramiz, aks holda u oynani ham yopib yuboradi
  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 150 }}>
      <div className="modal frame-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Rasmni joylashtirish</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="frame-wrap">
          <div
            ref={frameRef}
            className="frame-box"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onWheel={onWheel}
          >
            <img src={preview} alt="" draggable={false} style={frameStyle(preview)} />
            <div className="frame-grid" />
          </div>
          <div className="hint" style={{ textAlign: 'center', marginTop: 8 }}>
            Rasmni barmoq yoki sichqoncha bilan suring
          </div>
        </div>

        <label className="label" style={{ marginTop: 14 }}>
          Kattalik: <b>{Math.round(f.z * 100)}%</b>
        </label>
        <div className="frame-zoom">
          <button
            type="button"
            className="btn light sm"
            onClick={() => setF((s) => ({ ...s, z: Math.max(0.5, +(s.z - 0.1).toFixed(2)) }))}
          >
            −
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.01"
            value={f.z}
            onChange={(e) => setF((s) => ({ ...s, z: Number(e.target.value) }))}
          />
          <button
            type="button"
            className="btn light sm"
            onClick={() => setF((s) => ({ ...s, z: Math.min(3, +(s.z + 0.1).toFixed(2)) }))}
          >
            +
          </button>
        </div>

        <label className="frame-check">
          <input
            type="checkbox"
            checked={f.fit === 'contain'}
            onChange={(e) => setF((s) => ({ ...s, fit: e.target.checked ? 'contain' : 'cover' }))}
          />
          Rasmni to'liq ko'rsatish (kesmasdan, yonlarida fon qoladi)
        </label>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="button" className="btn light" onClick={() => setF({ z: 1, x: 50, y: 50, fit: 'cover' })}>
            ↺ Asl holat
          </button>
          <button type="button" className="btn" style={{ flex: 1 }} onClick={() => onSave(preview)}>
            Saqlash
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
