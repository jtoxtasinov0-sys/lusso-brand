import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard, { onImgError, discountOf, PLACEHOLDER } from '../components/ProductCard';
import { frameStyle } from '../framing';
import Icon from '../components/Icon';
import { money } from '../i18n';
import { haptic } from '../telegram';
import { isDecant } from '../constants';
import { ContactCard } from '../components/ContactSheet';

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

// Bosh sahifa sarlavhasi: salomlashish, til va logo. Orqada to'q yoy (dizayn elementi).
function Hello({ greet, name, sub, lang, onLang }) {
  return (
    <header className="hello rise">
      <div className="hello-text">
        <h1>
          {greet}, <span>{name}</span>
        </h1>
        <p>{sub}</p>
      </div>
      <div className="hello-actions">
        <button className="lang-pill" onClick={onLang}>
          {lang === 'ru' ? 'RU' : 'UZ'}
        </button>
        <img className="hello-logo" src="/logo.png" alt="LUSSO" />
      </div>
    </header>
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

  if (!items.length) return <div className="skel" style={{ height: 210 }} />;

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
              <div className="slide-info">
                <span className="tag">{d > 0 ? `−${d}% · ${t.sale}` : t.promoKicker}</span>
                <h3>{lang === 'ru' ? p.nameRu : p.nameUz}</h3>
                <div className="slide-price">
                  <b>{money(p.price)}</b>
                  {d > 0 && <s>{money(p.oldPrice)}</s>}
                </div>
                <span className="slide-go">
                  {t.view} <Icon name="arrow" />
                </span>
              </div>
              <div className="slide-img">
                <img
                  src={p.images?.[0]?.url || PLACEHOLDER}
                  alt=""
                  style={frameStyle(p.images?.[0]?.url)}
                  onError={onImgError}
                />
              </div>
            </div>
          );
        })}
      </div>
      {items.length > 1 && (
        <div className="showcase-dots">
          {items.map((p, i) => (
            <span key={p.id} className={i === active ? 'on' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}

function Rail({ title, items, lang, t, onOpen, onQuickAdd, onAll }) {
  if (!items.length) return null;
  return (
    <>
      <div className="section-head">
        <h2>{title}</h2>
        {onAll && (
          <button onClick={onAll}>
            {t.seeAll} <Icon name="arrow" />
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

  // Quyma atirlar faqat o'z bo'limida — tavsiyalarga aralashmaydi
  const featured = useMemo(() => products.filter((p) => !isDecant(p)), [products]);
  const sale = useMemo(
    () => featured.filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a)),
    [featured]
  );
  const newOnes = useMemo(() => featured.filter((p) => p.isNew).slice(0, 10), [featured]);

  // Karuselga: eng katta chegirmalar, bo'lmasa — eng yangilar (har kategoriyadan aralash)
  const showcase = useMemo(() => {
    const pool = sale.length >= 3 ? sale : featured;
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
  }, [sale, featured]);

  // Kategoriya plitkalari uchun — har kategoriyaning birinchi rasmi
  const catCover = (c) => c.imageUrl || products.find((p) => p.category?.slug === c.slug)?.images?.[0]?.url;
  const catCount = (slug) => products.filter((p) => p.category?.slug === slug).length;

  return (
    <div className="page home">
      <div className="home-arc" aria-hidden="true">
        <span className="arc-blob" />
        <span className="arc-orbit" />
        <span className="arc-orbit o2" />
        <span className="arc-star">✦</span>
        <span className="arc-star s2">✦</span>
      </div>
      <Hello greet={greet} name={firstName} sub={t.welcomeSub} lang={lang} onLang={onLang} />

      <button className="search-fake rise" style={{ '--i': 1 }} onClick={() => goCatalog(null, true)}>
        <Icon name="search" />
        <span>{t.search}</span>
      </button>

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

      {categories.length > 0 && (
        <>
          <div className="section-head">
            <h2>{t.categories}</h2>
            <button className="pill-link" onClick={() => goCatalog()}>
              {t.seeAll} <Icon name="arrow" />
            </button>
          </div>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <button
                key={c.id}
                className="cat-card rise"
                style={{ '--i': i }}
                onClick={() => {
                  haptic('light');
                  goCatalog(c.slug);
                }}
              >
                <div className="cat-img">
                  {catCover(c) ? (
                    <img src={catCover(c)} alt="" style={frameStyle(catCover(c))} onError={onImgError} />
                  ) : (
                    <span className="emo">{c.emoji}</span>
                  )}
                </div>
                <div className="cat-meta">
                  <div>
                    <b>{lang === 'ru' ? c.nameRu : c.nameUz}</b>
                    <small>
                      {catCount(c.slug)} {t.items}
                    </small>
                  </div>
                  <span className="cat-go">
                    <Icon name="arrow" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="section-head">
        <h2>{t.promoTitle}</h2>
      </div>
      {loading && !products.length ? (
        <div className="skel" style={{ height: 210 }} />
      ) : (
        <Showcase items={showcase} lang={lang} t={t} onOpen={onOpen} />
      )}

      <Rail
        title={t.bestsellers}
        items={bestsellers}
        lang={lang}
        t={t}
        onOpen={onOpen}
        onQuickAdd={onQuickAdd}
        onAll={() => goCatalog()}
      />

      <Rail
        title={t.newArrivals}
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
            <h2>{t.discounted}</h2>
          </div>
          <div className="grid">
            {sale.slice(0, 6).map((p, i) => (
              <ProductCard key={p.id} index={i} product={p} lang={lang} t={t} onOpen={onOpen} onQuickAdd={onQuickAdd} />
            ))}
          </div>
        </>
      )}

      <ContactCard t={t} />
    </div>
  );
}
