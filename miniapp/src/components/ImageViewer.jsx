import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { haptic } from '../telegram';
import { onImgError } from './ProductCard';
import Icon from './Icon';

const MAX = 4;
const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
const mid = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

// Bitta rasm: ikki barmoq bilan kattalashtirish, surish, ikki marta bosish (2.5x)
function ZoomImg({ src, alt, onZoom }) {
  const ref = useRef(null);
  const [tf, setTf] = useState({ s: 1, x: 0, y: 0 });
  const tfRef = useRef(tf);
  const gesture = useRef(null);
  const lastTap = useRef(0);

  const apply = (next) => {
    const el = ref.current;
    if (el) {
      const mx = (el.clientWidth * (next.s - 1)) / 2;
      const my = (el.clientHeight * (next.s - 1)) / 2;
      next = { s: next.s, x: Math.max(-mx, Math.min(mx, next.x)), y: Math.max(-my, Math.min(my, next.y)) };
    }
    tfRef.current = next;
    setTf(next);
    onZoom(next.s > 1.01);
  };

  // Markazga nisbatan nuqta atrofida kattalashtirish
  const zoomAt = (s, px, py) => {
    const r = ref.current.getBoundingClientRect();
    const cx = px - (r.left + r.width / 2);
    const cy = py - (r.top + r.height / 2);
    const cur = tfRef.current;
    const k = s / cur.s;
    apply({ s, x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k });
  };

  useEffect(() => {
    const el = ref.current;

    const start = (e) => {
      const t = e.touches;
      const cur = tfRef.current;
      if (t.length === 2) {
        gesture.current = { type: 'pinch', d: dist(t[0], t[1]), m: mid(t[0], t[1]), ...cur };
      } else if (t.length === 1) {
        gesture.current = { type: 'pan', px: t[0].clientX, py: t[0].clientY, moved: false, ...cur };
      }
    };

    const move = (e) => {
      const g = gesture.current;
      const t = e.touches;
      if (!g) return;
      if (g.type === 'pinch' && t.length === 2) {
        e.preventDefault();
        const s = Math.max(1, Math.min(MAX, (g.s * dist(t[0], t[1])) / g.d));
        const m = mid(t[0], t[1]);
        const r = el.getBoundingClientRect();
        const cx = g.m.x - (r.left + r.width / 2);
        const cy = g.m.y - (r.top + r.height / 2);
        const k = s / g.s;
        apply({ s, x: cx - (cx - g.x) * k + (m.x - g.m.x), y: cy - (cy - g.y) * k + (m.y - g.m.y) });
      } else if (g.type === 'pan' && t.length === 1) {
        const dx = t[0].clientX - g.px;
        const dy = t[0].clientY - g.py;
        if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
        if (g.s > 1.01) {
          e.preventDefault();
          apply({ s: g.s, x: g.x + dx, y: g.y + dy });
        }
      }
    };

    const end = (e) => {
      const g = gesture.current;
      if (e.touches.length === 1) {
        // pinch tugadi, bitta barmoq qoldi — surishni davom ettiramiz
        const t = e.touches[0];
        gesture.current = { type: 'pan', px: t.clientX, py: t.clientY, moved: true, ...tfRef.current };
        return;
      }
      gesture.current = null;
      if (tfRef.current.s < 1.05) apply({ s: 1, x: 0, y: 0 });

      if (g?.type === 'pan' && !g.moved && e.changedTouches.length === 1) {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          lastTap.current = 0;
          e.preventDefault();
          haptic('light');
          const c = e.changedTouches[0];
          if (tfRef.current.s > 1.01) apply({ s: 1, x: 0, y: 0 });
          else zoomAt(2.5, c.clientX, c.clientY);
        } else {
          lastTap.current = now;
        }
      }
    };

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('touchcancel', end, { passive: false });
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="iv-slide"
      ref={ref}
      onDoubleClick={(e) => (tfRef.current.s > 1.01 ? apply({ s: 1, x: 0, y: 0 }) : zoomAt(2.5, e.clientX, e.clientY))}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onError={onImgError}
        style={{
          transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.s})`,
          transition: gesture.current ? 'none' : undefined,
        }}
      />
    </div>
  );
}

// To'liq ekranli rasm ko'rish oynasi
export default function ImageViewer({ images, start = 0, alt = '', onClose }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = el.clientWidth * start;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return createPortal(
    <div className="iv">
      <div className="iv-top">
        <span>{images.length > 1 ? `${index + 1} / ${images.length}` : ''}</span>
        <button className="iv-close" onClick={onClose} aria-label="✕">
          <Icon name="close" />
        </button>
      </div>
      <div className={`iv-track ${zoomed ? 'locked' : ''}`} ref={trackRef} onScroll={onScroll}>
        {images.map((src, i) => (
          <ZoomImg key={i} src={src} alt={alt} onZoom={setZoomed} />
        ))}
      </div>
      {images.length > 1 && (
        <div className="gallery-dots iv-dots">
          {images.map((_, i) => (
            <span key={i} className={i === index ? 'on' : ''} />
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
