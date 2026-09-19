import { useEffect, useState } from 'react';
import { money } from '../i18n';
import { haptic } from '../telegram';
import { PLACEHOLDER, onImgError } from './ProductCard';

const SIZE_TABLE = [
  ['240', '38', '6'],
  ['245', '39', '6.5'],
  ['250', '40', '7'],
  ['255', '40.5', '7.5'],
  ['260', '41', '8'],
  ['265', '42', '8.5'],
  ['270', '43', '9'],
  ['275', '43.5', '9.5'],
  ['280', '44', '10'],
  ['285', '45', '11'],
];

export default function ProductSheet({ product, lang, t, onClose, onAdd }) {
  const [variantId, setVariantId] = useState(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const available = product.variants?.filter((v) => v.stock > 0) || [];
    setVariantId(available.length === 1 ? available[0].id : null);
    setShowTable(false);
  }, [product]);

  const name = lang === 'ru' ? product.nameRu : product.nameUz;
  const desc = (lang === 'ru' ? product.descRu : product.descUz) || '';
  const isShoes = product.category?.slug === 'shoes';
  const variants = product.variants || [];
  const variant = variants.find((v) => v.id === variantId);
  const price = product.price + (variant?.extraPrice || 0);
  const images = product.images?.length ? product.images : [{ url: PLACEHOLDER }];

  const add = () => {
    if (variants.length > 1 && !variant) {
      haptic('warning');
      return;
    }
    haptic('success');
    onAdd({
      productId: product.id,
      variantId: variant?.id || variants[0]?.id || null,
      name,
      variant: variant?.label || variants[0]?.label || null,
      price,
      image: images[0].url,
      qty: 1,
    });
    onClose();
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        <div className="sheet-body">
          <div className="sheet-gallery">
            {images.map((im, i) => (
              <img key={i} src={im.url} alt={name} onError={onImgError} />
            ))}
          </div>

          {product.brand && <div className="brand" style={{ marginTop: 14 }}>{product.brand}</div>}
          <h2>{name}</h2>

          <div className="price-row">
            <span className="price-new" style={{ fontSize: 20 }}>
              {money(price)}
            </span>
            {product.oldPrice ? (
              <span className="price-old" style={{ fontSize: 14 }}>
                {money(product.oldPrice)}
              </span>
            ) : null}
          </div>

          {desc && (
            <ul className="desc-list">
              {desc
                .split('\n')
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          )}

          {variants.length > 0 && (
            <>
              <div className="opt-label">
                <span>{isShoes ? t.chooseSize : t.chooseOption}</span>
                {isShoes && (
                  <button onClick={() => setShowTable(!showTable)}>{t.sizeGuide}</button>
                )}
              </div>

              {showTable && (
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>MM (KR)</th>
                      <th>EU</th>
                      <th>US</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_TABLE.map((r) => (
                      <tr key={r[0]}>
                        <td>{r[0]}</td>
                        <td>{r[1]}</td>
                        <td>{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="sizes">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    className={`size ${v.stock <= 0 ? 'off' : v.id === variantId ? 'on' : ''}`}
                    disabled={v.stock <= 0}
                    onClick={() => {
                      haptic('light');
                      setVariantId(v.id);
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {variant && variant.stock <= 3 && (
                <div className="stock-hint">
                  ⚡ {variant.stock} {t.inStock}
                </div>
              )}
            </>
          )}
        </div>

        <div className="sheet-cta">
          <button className="btn" onClick={add} disabled={variants.length > 1 && !variant}>
            {variants.length > 1 && !variant ? t.selectFirst : `${t.addToCart} — ${money(price)}`}
          </button>
        </div>
      </div>
    </>
  );
}
