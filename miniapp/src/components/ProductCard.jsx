import { money } from '../i18n';
import { haptic } from '../telegram';

export const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f4f4f5"/><text x="50%" y="52%" font-size="54" text-anchor="middle" fill="%23c9c9cf">LUSSO</text></svg>'
  );

export function onImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER;
}

export default function ProductCard({ product, lang, onOpen, onQuickAdd }) {
  const name = lang === 'ru' ? product.nameRu : product.nameUz;
  const img = product.images?.[0]?.url || PLACEHOLDER;
  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card-img">
        <img src={img} alt={name} loading="lazy" onError={onImgError} />
        {discount > 0 && <div className="badge">-{discount}%</div>}
        {!discount && product.isNew && <div className="badge new">NEW</div>}
        <button
          className="plus"
          onClick={(e) => {
            e.stopPropagation();
            haptic('light');
            onQuickAdd(product);
          }}
        >
          +
        </button>
      </div>

      {product.brand && <div className="card-brand">{product.brand}</div>}
      <div className="card-name">{name}</div>
      <div className="price-row">
        <span className="price-new">{money(product.price)}</span>
        {product.oldPrice ? <span className="price-old">{money(product.oldPrice)}</span> : null}
      </div>
    </div>
  );
}
