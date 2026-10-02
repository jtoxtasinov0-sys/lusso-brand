import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Rasmni butun ekranga ochish. Bosilsa 2.5x kattalashadi (surib ko'rish mumkin), ✕ — yopish.
export default function ImageZoom({ src, onClose }) {
  const [big, setBig] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="zoom-view" onClick={onClose}>
      <button className="zoom-close" onClick={onClose}>
        ✕
      </button>
      <div className={`zoom-scroll ${big ? 'big' : ''}`}>
        <img
          src={src}
          alt=""
          onClick={(e) => {
            e.stopPropagation();
            setBig(!big);
          }}
        />
      </div>
      <div className="zoom-hint">{big ? 'Kichraytirish uchun bosing' : 'Kattalashtirish uchun rasmni bosing'}</div>
    </div>,
    document.body,
  );
}
