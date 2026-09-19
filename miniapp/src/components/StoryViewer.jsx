import { useEffect, useRef, useState } from 'react';
import { haptic } from '../telegram';
import { onImgError } from './ProductCard';

const DURATION = 5000; // har bir story necha ms turadi

export default function StoryViewer({ stories, startIndex = 0, lang, t, onClose, onShop }) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const pausedRef = useRef(false); // barmoq bosib turilsa — to'xtaydi
  const elapsedRef = useRef(0);
  const lastRef = useRef(Date.now());

  const story = stories[index];

  const next = () => {
    if (index < stories.length - 1) setIndex(index + 1);
    else onClose();
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
    else {
      elapsedRef.current = 0;
      setProgress(0);
    }
  };

  // Taymer: progress va avtomatik keyingisiga o'tish
  useEffect(() => {
    elapsedRef.current = 0;
    lastRef.current = Date.now();
    setProgress(0);

    let finished = false;

    const tick = setInterval(() => {
      const now = Date.now();
      const dt = now - lastRef.current;
      lastRef.current = now;

      if (pausedRef.current) return;

      elapsedRef.current += dt;
      const p = Math.min(1, elapsedRef.current / DURATION);
      setProgress(p);

      if (p >= 1 && !finished) {
        finished = true;
        clearInterval(tick);
        next();
      }
    }, 50);

    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, stories.length]);

  // Klaviatura (brauzerda test qilish uchun)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!story) return null;

  const title = lang === 'ru' ? story.titleRu : story.titleUz;

  const hold = (value) => () => {
    pausedRef.current = value;
  };

  return (
    <div className="story-viewer">
      {/* Yuqoridagi progress chiziqlari */}
      <div className="sv-bars">
        {stories.map((_, i) => (
          <div className="sv-bar" key={i}>
            <i style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' }} />
          </div>
        ))}
      </div>

      <button className="sv-close" onClick={onClose}>
        ✕
      </button>

      <img className="sv-img" src={story.imageUrl} alt={title} onError={onImgError} />

      {/* Chap / o'ng bosish joylari */}
      <div
        className="sv-tap left"
        onClick={() => {
          haptic('light');
          prev();
        }}
        onPointerDown={hold(true)}
        onPointerUp={hold(false)}
        onPointerCancel={hold(false)}
      />
      <div
        className="sv-tap right"
        onClick={() => {
          haptic('light');
          next();
        }}
        onPointerDown={hold(true)}
        onPointerUp={hold(false)}
        onPointerCancel={hold(false)}
      />

      <div className="sv-bottom">
        {title && <div className="sv-title">{title}</div>}
        <button
          className="btn btn-gold"
          onClick={() => {
            haptic('light');
            onShop(story);
          }}
        >
          {t.storyShop}
        </button>
      </div>
    </div>
  );
}
