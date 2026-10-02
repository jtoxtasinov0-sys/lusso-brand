import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard, { onImgError, discountOf, PLACEHOLDER } from '../components/ProductCard';
import Icon from '../components/Icon';
import { money } from '../i18n';
import { haptic } from '../telegram';

const SLIDE_MS = 4500;

// Koreya vaqti bo'yicha salomlashish (Asia/Seoul)
function seoulHour() {
  try {
    return Number(
      new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Seoul' }).format(new Date())
    ) % 24;
  } catch {
    return new Date().getHours();
  }
}

export function TopBar({ lang, onLang, onSearch }) {
  return (
    <div className="topbar">
      <div className="wordmark">
        <img src="/logo.svg" alt="" />
        <div>
          <b className="gold-text">LUSSO</b>
          <small>BRAND · KOREA</small>
        </div>
      </div>
      <div className="top-actions">
        <button className="lang-pill" onClick={onLang}>
          {lang === 'ru' ? 'RU' : 'UZ'}
        </button>
        {onSearch && (
          <button className="icon-btn" onClick={onSearch} aria-label="search">
            <Icon name="search" />
          </button>
        )}
      </div>
    </div>
  );
}

function Showcase({ items, lang, t, onOpen }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const touching = useRef(false);

  // Avtomatik aylanish
  useEffect(() => {
    if (items.length < 2) return undefined;
    const id = setTimeout(() => {
      if (touching.current) return;
      const next = (active + 1) % items.length;
      const el = trackRef.current;
      if (el) el.scrollTo({ left: next * (el.clientWidth - 32 + 12), behavior: 'smooth' });
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [active, items.length]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / (el.clientWidth - 32 + 12));
    if (i !== active && i >= 0 && i < items.length) setActive(i);
  };

  if (!items.length) return <div className="skel" style={{ height: 380 }} />;

  return (
    <div className="showcase">
      <div
        className="showcase-track"
        ref={trackRef}
        onScroll={onScroll}
        onTouchStart={() => (touching.current = true)}
        onTouchEnd={() => (touching.current = false)}
      >
        {items.map((p, i) => {
          const d = discountOf(p);
          return (
            <div
              key={p.id}
              className={`slide ${i === active ? 'active' : ''}`}
              onClick={() => {
                haptic('light');
                onOpen(p);
              }}
            >
              <div className="slide-img">
                <img src={p.images?.[0]?.url || PLACEHOLDER} alt="" onError={onImgError} />
              </div>
              <div className="slide-info">
                <span className="tag">{d > 0 ? `−${d}% · ${t.sale}` : p.brand || 'LUSSO'}</span>
                <h3>{lang === 'ru' ? p.nameRu : p.nameUz}</h3>
                <div className="slide-row">
                  <div className="price-row" style={{ marginTop: 0 }}>
                    <span className="price-new" style={{ fontSize: 18 }}>
                      {money(p.price)}
                    </span>
                    {d > 0 && <span className="price-old">{money(p.oldPrice)}</span>}
                  </div>
                  <span className="slide-go">
                    {t.view} <Icon name="arrow" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {items.length > 1 && (
        <div className="showcase-bars" style={{ '--dur': `${SLIDE_MS}ms` }}>
          {items.map((p, i) => (
            <span key={p.id + '-' + (i === active ? active : 'x')} className={i === active ? 'on' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}

function Rail({ title, kicker, items, lang, t, onOpen, onQuickAdd, onAll }) {
  if (!items.length) return null;
  return (
    <>
      <div className="section-head">
        <h2>
          <small>{kicker}</small>
          {title}
        </h2>
        {onAll && (
          <button onClick={onAll}>
            {t.seeAll} <Icon name="next" />
          </button>
        )}
      </div>
      <div className="rail">
        {items.map((p, i) => (
          <ProductCard key={p.id} index={i} product={p} lang={lang} t={t} onOpen={onOpen} onQuickAdd={onQuickAdd} />
        ))}
      </div>
    </>
  );
}

export default function Home({
  t,
  lang,
  user,
  stories,
  products,
  categories,
  bestsellers = [],
  loading,
  onOpen,
  onQuickAdd,
  goCatalog,
  onStoryClick,
  onLang,
}) {
  const firstName = user?.firstName || t.guest;
  const h = seoulHour();
  const greet = h < 5 ? t.goodNight : h < 12 ? t.goodMorning : h < 18 ? t.goodDay : t.goodEvening;

  const sale = useMemo(
    () => products.filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a)),
    [products]
  );
  const newOnes = useMemo(() => products.filter((p) => p.isNew).slice(0, 10), [products]);

  // Karuselga: eng katta chegirmalar, bo'lmasa — eng yangilar (har kategoriyadan aralash)
  const showcase = useMemo(() => {
    const pool = sale.length >= 3 ? sale : products;
    const seen = new Set();
    const out = [];
    for (const p of pool) {
      const c = p.category?.slug;
      if (!seen.has(c)) {
        seen.add(c);
        out.push(p);
      }
    }
    for (const p of pool) if (out.length < 5 && !out.includes(p)) out.push(p);
    return out.slice(0, 5);
  }, [sale, products]);

  // Kategoriya plitkalari uchun — har kategoriyaning birinchi rasmi
  const catCover = (slug) => products.find((p) => p.category?.slug === slug)?.images?.[0]?.url;
  const catCount = (slug) => products.filter((p) => p.category?.slug === slug).length;

  const perks = [t.mqDelivery, t.mqFree, t.mqPay, t.mqSupport];

  return (
    <div className="page">
      <TopBar lang={lang} onLang={onLang} onSearch={() => goCatalog(null, true)} />

      <div className="greet rise">
        <div className="kr">안녕하세요 · {greet}</div>
        <h1>
          {firstName}, <i className="gold-text">{t.welcomeSub}</i>
        </h1>
      </div>

      {stories.length > 0 && (
        <div className="stories">
          {stories.map((s, i) => (
            <div className="story rise" style={{ '--i': i }} key={s.id} onClick={() => onStoryClick(i)}>
              <div className="story-ring">
                <img src={s.imageUrl} alt="" onError={onImgError} />
              </div>
              <span>{lang === 'ru' ? s.titleRu : s.titleUz}</span>
            </div>
          ))}
        </div>
      )}

      {loading && !products.length ? (
        <div className="skel" style={{ height: 380 }} />
      ) : (
        <Showcase items={showcase} lang={lang} t={t} onOpen={onOpen} />
      )}

      <div className="marquee">
        <div className="marquee-inner">
          {[...perks, ...perks].map((p, i) => (
            <span key={i}>
              <b>✦</b>
              {p}
            </span>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 0 }}>
            <h2>
              <small>{t.collections}</small>
              {t.categories}
            </h2>
          </div>
          <div className="bento">
            {categories.slice(0, 3).map((c, i) => (
              <button
                key={c.id}
                className="bento-tile rise"
                style={{ '--i': i }}
                onClick={() => {
                  haptic('light');
                  goCatalog(c.slug);
                }}
              >
                {catCover(c.slug) && <img src={catCover(c.slug)} alt="" onError={onImgError} />}
                <span className="emo">{c.emoji}</span>
                <b>{lang === 'ru' ? c.nameRu : c.nameUz}</b>
                <small>
                  {catCount(c.slug)} {t.items}
                </small>
              </button>
            ))}
          </div>
        </>
      )}

      <Rail
        title={t.bestsellers}
        kicker="BEST"
        items={bestsellers}
        lang={lang}
        t={t}
        onOpen={onOpen}
        onQuickAdd={onQuickAdd}
        onAll={() => goCatalog()}
      />

      <Rail
        title={t.newArrivals}
        kicker="NEW IN"
        items={newOnes}
        lang={lang}
        t={t}
        onOpen={onOpen}
        onQuickAdd={onQuickAdd}
        onAll={() => goCatalog()}
      />

      {sale.length > 0 && (
        <>
          <div className="section-head">
            <h2>
              <small>SALE · 할인</small>
              {t.discounted}
            </h2>
          </div>
          <div className="grid">
            {sale.slice(0, 6).map((p, i) => (
              <ProductCard key={p.id} index={i} product={p} lang={lang} t={t} onOpen={onOpen} onQuickAdd={onQuickAdd} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
