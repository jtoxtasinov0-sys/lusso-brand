import { useRef, useState } from 'react';
import { money } from '../i18n';
import { haptic } from '../telegram';
import { useFav } from '../store';
import Icon from './Icon';
import { frameStyle } from '../framing';

export const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#f3efe7"/><text x="50%" y="52%" font-family="Georgia" font-size="44" letter-spacing="10" text-anchor="middle" fill="#cdbf9c">LUSSO</text></svg>'
  );

export function onImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER;
}

export const discountOf = (p) =>
  p.oldPrice && p.oldPrice > p.price ? Math.round(100 - (p.price / p.oldPrice) * 100) : 0;

export const inStock = (p) => !p.variants?.length || p.variants.some((v) => v.stock > 0);

export default function ProductCard({ product, lang, t, onOpen, onQuickAdd, index = 0 }) {
  const name = lang === 'ru' ? product.nameRu : product.nameUz;
  const img = product.images?.[0]?.url || PLACEHOLDER;
  const discount = discountOf(product);
  const available = inStock(product);
  const fav = useFav((s) => s.ids.includes(product.id));
  const toggleFav = useFav((s) => s.toggle);

  const [ready, setReady] = useState(false);
  const [added, setAdded] = useState(false);
  const imgRef = useRef(null);

  // Rang/hajm variantlari bo'lsa (o'lcham emas) — kartada nechtaligini ko'rsatamiz
  const variants = product.variants || [];
  const isShoes = product.category?.slug === 'shoes';
  const showVariants = !isShoes && variants.length > 1;

  return (
    <div className="card rise" style={{ '--i': Math.min(index, 8) }} onClick={() => onOpen(product)}>
      <div className={`card-img ${ready ? 'ready' : ''}`}>
        <img
          ref={imgRef}
          src={img}
          alt={name}
          style={frameStyle(img)}
          loading="lazy"
          className={ready ? 'loaded' : ''}
          onLoad={() => setReady(true)}
          onError={(e) => {
            onImgError(e);
            setReady(true);
          }}
        />
        {!available ? (
          <div className="ribbon out">{t.outOfStock}</div>
        ) : discount > 0 ? (
          <div className="ribbon">−{discount}%</div>
        ) : product.isNew ? (
          <div className="ribbon new">NEW</div>
        ) : null}

        <button
          className={`heart ${fav ? 'on' : ''}`}
          aria-label="♡"
          onClick={(e) => {
            e.stopPropagation();
            haptic(fav ? 'light' : 'success');
            toggleFav(product.id);
          }}
        >
          <Icon name="heart" fill={fav} />
        </button>

        {available && (
          <button
            className={`quick ${added ? 'done' : ''}`}
            aria-label={t.addToCart}
            onClick={(e) => {
              e.stopPropagation();
              haptic('light');
              const ok = onQuickAdd(product, imgRef.current);
              if (ok) {
                setAdded(true);
                setTimeout(() => setAdded(false), 1400);
              }
            }}
          >
            <Icon name={added ? 'check' : 'plus'} />
          </button>
        )}
      </div>

      {product.brand && <div className="card-brand">{product.brand}</div>}
      <div className="card-name">{name}</div>
      <div className="price-row">
        <span className="price-new">{money(product.price)}</span>
        {discount > 0 && <span className="price-old">{money(product.oldPrice)}</span>}
      </div>
      {showVariants && (
        <div className="swatches">
          {variants.length} {t.variantsCount}
        </div>
      )}
    </div>
  );
}
