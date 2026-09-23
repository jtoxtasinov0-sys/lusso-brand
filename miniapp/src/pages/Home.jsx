import ProductCard, { onImgError } from '../components/ProductCard';

export default function Home({
  t,
  lang,
  user,
  stories,
  products,
  bestsellers = [],
  loading,
  onOpen,
  onQuickAdd,
  goCatalog,
  onStoryClick,
}) {
  const firstName = user?.firstName || 'Mijoz';
  const newOnes = products.filter((p) => p.isNew).slice(0, 8);
  const sale = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => b.oldPrice - b.price - (a.oldPrice - a.price))
    .slice(0, 8);

  return (
    <div className="page">
      <div className="header">
        <div>
          <div className="hi">{t.hello} 👋</div>
          <div className="name">{firstName}</div>
        </div>
        <div className="avatar">{firstName.charAt(0).toUpperCase()}</div>
      </div>

      {stories.length > 0 && (
        <div className="stories">
          {stories.map((s, i) => (
            <div className="story" key={s.id} onClick={() => onStoryClick(i)}>
              <div className="story-ring">
                <img src={s.imageUrl} alt="" onError={onImgError} />
              </div>
              <span>{lang === 'ru' ? s.titleRu : s.titleUz}</span>
            </div>
          ))}
        </div>
      )}

      <div className="hero">
        <div className="glow">🛍</div>
        <h3>{t.heroTitle}</h3>
        <p>{t.heroText}</p>
        <button onClick={goCatalog}>{t.heroBtn}</button>
      </div>

      {bestsellers.length > 0 && (
        <>
          <div className="section-head">
            <h2>{t.bestsellers}</h2>
            <button onClick={goCatalog}>{t.seeAll}</button>
          </div>
          <div className="row-scroll">
            {bestsellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                lang={lang}
                onOpen={onOpen}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        </>
      )}

      {loading ? (
        <div className="grid" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skel skel-card" />
          ))}
        </div>
      ) : (
        <>
          {newOnes.length > 0 && (
            <>
              <div className="section-head">
                <h2>🔥 {t.newArrivals}</h2>
                <button onClick={goCatalog}>{t.seeAll}</button>
              </div>
              <div className="row-scroll">
                {newOnes.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    onOpen={onOpen}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            </>
          )}

          {sale.length > 0 && (
            <>
              <div className="section-head">
                <h2>💸 {t.discounted}</h2>
                <button onClick={goCatalog}>{t.seeAll}</button>
              </div>
              <div className="row-scroll">
                {sale.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    onOpen={onOpen}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
