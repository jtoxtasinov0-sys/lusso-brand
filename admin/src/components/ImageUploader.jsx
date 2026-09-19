import { useRef, useState } from 'react';
import api from '../api';

// Rasm yuklash: galereyadan tanlash, sudrab tashlash yoki havola qo'yish
export default function ImageUploader({ images = [], onChange, onError }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [url, setUrl] = useState('');

  const uploadFiles = async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(true);
    const added = [];
    for (const file of list) {
      try {
        const res = await api.upload(file);
        added.push(res.url);
      } catch (e) {
        onError?.(e.message);
      }
    }
    onChange([...images, ...added]);
    setBusy(false);
  };

  const onPick = (e) => {
    uploadFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    uploadFiles(e.dataTransfer.files);
  };

  const addUrl = () => {
    const value = url.trim();
    if (!value) return;
    onChange([...images, value]);
    setUrl('');
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));

  const makeMain = (i) => {
    if (i === 0) return;
    const copy = [...images];
    const [item] = copy.splice(i, 1);
    onChange([item, ...copy]);
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="img-list">
          {images.map((src, i) => (
            <div className="img-item" key={src + i} title="Asosiy qilish uchun bosing">
              <img src={src} alt="" onClick={() => makeMain(i)} />
              <button type="button" className="del" onClick={() => remove(i)}>
                ✕
              </button>
              {i === 0 && <div className="main-tag">ASOSIY</div>}
            </div>
          ))}
        </div>
      )}

      <div
        className={`uploader ${drag ? 'drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={onPick}
        />

        <button type="button" className="btn" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? '⏳ Yuklanmoqda...' : '🖼 Galereyadan rasm tanlash'}
        </button>

        <div className="hint">yoki rasmni shu yerga sudrab tashlang (bir nechta bo'lishi mumkin)</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          className="input"
          placeholder="yoki rasm havolasi (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
        />
        <button type="button" className="btn light" onClick={addUrl}>
          Qo'shish
        </button>
      </div>
    </div>
  );
}
