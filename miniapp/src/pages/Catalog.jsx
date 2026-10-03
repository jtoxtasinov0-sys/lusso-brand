import { useLayoutEffect, useRef, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import ImageViewer from '../components/ImageViewer';
import { ContactCard } from '../components/ContactSheet';
import { onImgError } from '../components/ProductCard';
import { haptic } from '../telegram';

export default function Catalog({
  t,
  lang,
  categories,
  brands = [],
  products,
  loading,
  category,
  setCategory,
  brand,
  setBrand,
  search,
  setSearch,
  sort,
  setSort,
  onOpen,
  onQuickAdd,
  autoFocus,
}) {
  const segRef = useRef(null);
  const [glider, setGlider] = useState({ left: 4, width: 0 });
  const [viewer, setViewer] = useState(null);

  // Tanlangan kategoriyaning namunaviy rasmlari (masalan, quyma atir idishlari)
  const current = categories.find((c) => c.slug === category);
  const gallery = current?.gallery || [];
  const note = current && (lang === 'ru' ? current.noteRu : current.noteUz);

  const sorts = [
    { key: '', label: t.sortDefault },
    { key: 'new', label: t.sortNew },
    { key: 'price_asc', label: t.sortCheap },
    { key: 'price_desc', label: t.sortExpensive },
  ];
  const sortIdx = Math.max(0, sorts.findIndex((s) => s.key === sort));

  const segs = [{ slug: 'all', label: t.all }, ...categories.map((c) => ({ slug: c.slug, label: lang === 'ru' ? c.nameRu : c.nameUz }))];

  // Oltin "glider" tanlangan kategoriya ostiga suriladi
  useLayoutEffect(() => {
    const el = segRef.current?.querySelector('button.on');
    if (el) {
      setGlider({ left: el.offsetLeft, width: el.offsetWidth });
      // Tanlangan tugma ko'rinmay qolsa — tasmani o'sha tomonga suramiz
      const box = segRef.current;
      if (el.offsetLeft < box.scrollLeft) box.scrollTo({ left: el.offsetLeft - 8, behavior: 'smooth' });
      else if (el.offsetLeft + el.offsetWidth > box.scrollLeft + box.clientWidth)
        box.scrollTo({ left: el.offsetLeft + el.offsetWidth - box.clientWidth + 8, behavior: 'smooth' });
    }
  }, [category, categories, lang]);

  return (
    <div className="page">
      <h1 className="page-title rise">{t.navCatalog}</h1>
      <div className="page-sub rise" style={{ '--i': 1 }}>
        {t.catalogSub}
      </div>

      <label className="search rise" style={{ '--i': 2 }}>
        <Icon name="search" />
        <input
          value={search}
          autoFocus={autoFocus}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
        />
        {search && (
          <button onClick={() => setSearch('')} aria-label="✕">
            <Icon name="close" />
          </button>
        )}
      </label>

      <div className="seg" ref={segRef}>
        <div className="seg-glider" style={{ left: glider.left, width: glider.width }} />
        {segs.map((s) => (
          <button
            key={s.slug}
            className={category === s.slug ? 'on' : ''}
            onClick={() => {
              haptic('light');
              setCategory(s.slug);
              setBrand('');
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {(gallery.length > 0 || note) && (
        <div className="cat-intro rise">
          {gallery.length > 0 && (
            <div className="cat-gallery">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => {
                    haptic('light');
                    setViewer(i);
                  }}
                >
                  <img src={src} alt="" loading="lazy" onError={onImgError} />
                </button>
              ))}
            </div>
          )}
          {note && <p className="cat-note">{note}</p>}
        </div>
      )}

      {viewer !== null && <ImageViewer images={gallery} start={viewer} onClose={() => setViewer(null)} />}

      {brands.length > 1 && (
        <div className="chips">
          <button className={`chip ${!brand ? 'on' : ''}`} onClick={() => setBrand('')}>
            {t.allBrands}
          </button>
          {brands.map((b) => (
            <button
              key={b}
              className={`chip ${brand === b ? 'on' : ''}`}
              onClick={() => {
                haptic('light');
                setBrand(brand === b ? '' : b);
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      <div className="result-bar">
        <span>
          {loading ? '…' : products.length} {t.items}
        </span>
        <button
          onClick={() => {
            haptic('light');
            setSort(sorts[(sortIdx + 1) % sorts.length].key);
          }}
        >
          <Icon name="sort" /> {sorts[sortIdx].label}
        </button>
      </div>

      {loading ? (
        <div className="grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skel skel-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="em">🔍</div>
          <h3>{t.nothingFound}</h3>
          <p>{t.nothingFoundText}</p>
        </div>
      ) : (
        <div className="grid" key={category + brand + sort}>
          {products.map((p, i) => (
            <ProductCard key={p.id} index={i} product={p} lang={lang} t={t} onOpen={onOpen} onQuickAdd={onQuickAdd} />
          ))}
        </div>
      )}

      {!loading && <ContactCard t={t} />}
    </div>
  );
}
