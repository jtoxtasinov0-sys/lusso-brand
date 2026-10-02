import ProductCard from '../components/ProductCard';
import { useFav } from '../store';

// Sevimlilar — ♡ bosilgan mahsulotlar
export default function Saved({ t, lang, products, onOpen, onQuickAdd, goCatalog }) {
  const ids = useFav((s) => s.ids);
  const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="page">
      <h1 className="page-title rise">{t.savedTitle}</h1>
      <div className="page-sub rise" style={{ '--i': 1 }}>
        {t.savedSub}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="em">♡</div>
          <h3>{t.savedEmpty}</h3>
          <p>{t.savedEmptyText}</p>
          <button className="btn ghost" onClick={goCatalog}>
            {t.goCatalog}
          </button>
        </div>
      ) : (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.id} index={i} product={p} lang={lang} t={t} onOpen={onOpen} onQuickAdd={onQuickAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
