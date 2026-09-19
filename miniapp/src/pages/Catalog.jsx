import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { haptic } from '../telegram';

export default function Catalog({
  t,
  lang,
  categories,
  products,
  loading,
  category,
  setCategory,
  search,
  setSearch,
  sort,
  setSort,
  onOpen,
  onQuickAdd,
}) {
  const [showSort, setShowSort] = useState(false);

  const sorts = [
    { key: 'new', label: t.sortNew },
    { key: 'price_asc', label: t.sortCheap },
    { key: 'price_desc', label: t.sortExpensive },
  ];

  return (
    <div className="page">
      <div className="header">
        <div className="name">{t.navCatalog}</div>
        <button className="avatar" onClick={() => setShowSort(!showSort)}>
          ⇅
        </button>
      </div>

      <div className="search-box">
        <span>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
        />
        {search && <button onClick={() => setSearch('')}>✕</button>}
      </div>

      {showSort && (
        <div className="chips" style={{ marginTop: 10 }}>
          {sorts.map((s) => (
            <button
              key={s.key}
              className={`chip ${sort === s.key ? 'on' : ''}`}
              onClick={() => setSort(sort === s.key ? '' : s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="chips" style={{ marginTop: 14 }}>
        <button
          className={`chip ${category === 'all' ? 'on' : ''}`}
          onClick={() => {
            haptic('light');
            setCategory('all');
          }}
        >
          {t.all}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${category === c.slug ? 'on' : ''}`}
            onClick={() => {
              haptic('light');
              setCategory(c.slug);
            }}
          >
            <span>{c.emoji}</span>
            {lang === 'ru' ? c.nameRu : c.nameUz}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skel skel-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="center-empty">
          <div className="emoji">🔍</div>
          <h3>{t.nothingFound}</h3>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              lang={lang}
              onOpen={onOpen}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
