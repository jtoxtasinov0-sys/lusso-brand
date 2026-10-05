import { useEffect, useRef, useState } from 'react';
import { money } from '../i18n';
import { haptic } from '../telegram';
import { useApp, useFav } from '../store';
import { PLACEHOLDER, onImgError, discountOf, stockTotal } from './ProductCard';
import Icon from './Icon';
import ImageViewer from './ImageViewer';
import { ContactCard } from './ContactSheet';
import { frameStyle } from '../framing';
import { colorOf } from '../colors';

// Koreya o'lchami (mm) → EU / US
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
  const [slide, setSlide] = useState(0);
  const [closing, setClosing] = useState(false);
  const [viewer, setViewer] = useState(null); // ochilgan rasm indeksi
  const trackRef = useRef(null);
  const imgRefs = useRef([]);

  const fav = useFav((s) => s.ids.includes(product.id));
  const toggleFav = useFav((s) => s.toggle);
  const showStock = useApp((s) => s.settings?.showStock);

  const name = lang === 'ru' ? product.nameRu : product.nameUz;
  const desc = (lang === 'ru' ? product.descRu : product.descUz) || '';
  const isShoes = product.category?.slug === 'shoes';
  const variants = product.variants || [];
  const variant = variants.find((v) => v.id === variantId);
  const price = product.price + (variant?.extraPrice || 0);
  const images = product.images?.length ? product.images : [{ url: PLACEHOLDER }];
  const discount = discountOf(product);
  // Har bir rang/variantning o'z rasmi bor (rasmlar soni = variantlar soni)
  const imagePerVariant = !isShoes && variants.length > 1 && images.length === variants.length;

  useEffect(() => {
    const available = variants.filter((v) => v.stock > 0);
    setVariantId(available.length === 1 ? available[0].id : null);
    setShowTable(false);
    setSlide(0);
    trackRef.current?.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 260);
  };

  const goTo = (i) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== slide) setSlide(i);
  };

  const pick = (v, idx) => {
    haptic('light');
    setVariantId(v.id);
    if (imagePerVariant) goTo(idx);
  };

  const add = () => {
    if (variants.length > 1 && !variant) {
      haptic('warning');
      return;
    }
    haptic('success');
    const v = variant || variants[0];
    const imgIdx = imagePerVariant ? variants.indexOf(v) : 0;
    onAdd(
      {
        productId: product.id,
        variantId: v?.id || null,
        name,
        variant: v?.label || null,
        color: !isShoes && v ? colorOf(v) : null,
        price,
        image: images[Math.max(0, imgIdx)].url,
        qty: 1,
      },
      imgRefs.current[slide]
    );
    close();
  };

  const needPick = variants.length > 1 && !variant;

  return (
    <>
      <div className={`backdrop ${closing ? 'closing' : ''}`} onClick={close} />
      <div className={`sheet ${closing ? 'closing' : ''}`}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={close} aria-label="✕">
          <Icon name="close" />
        </button>
        <button
          className={`heart sheet-heart ${fav ? 'on' : ''}`}
          onClick={() => {
            haptic(fav ? 'light' : 'success');
            toggleFav(product.id);
          }}
        >
          <Icon name="heart" fill={fav} />
        </button>

        <div className="sheet-scroll">
          <div className="gallery">
            <div className="gallery-track" ref={trackRef} onScroll={onScroll}>
              {images.map((im, i) => (
                <div className="gallery-cell" key={i}>
                  <img
                    ref={(el) => (imgRefs.current[i] = el)}
                    src={im.url}
                    alt={name}
                    style={frameStyle(im.url)}
                    onError={onImgError}
                    onClick={() => {
                      haptic('light');
                      setViewer(i);
                    }}
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="gallery-dots">
                {images.map((_, i) => (
                  <span key={i} className={i === slide ? 'on' : ''} />
                ))}
              </div>
            )}
            <button className="gallery-zoom" onClick={() => setViewer(slide)} aria-label="zoom">
              <Icon name="expand" />
            </button>
          </div>

          <div className="sheet-info">
            {product.brand && <div className="brand">{product.brand}</div>}
            <h2>{name}</h2>

            <div className="sheet-price">
              <span className="now">{money(price)}</span>
              {discount > 0 && (
                <>
                  <span className="old">{money(product.oldPrice)}</span>
                  <span className="save">−{money(product.oldPrice - product.price)}</span>
                </>
              )}
            </div>

            {variants.length > 0 && !(variants.length === 1 && variants[0].label === 'Standart') && (
              <div>
                <div className="opt-label">
                  <span>
                    {isShoes ? t.chooseSize : t.chooseOption}
                    {variant && <em>{variant.label}</em>}
                  </span>
                  {isShoes && (
                    <button onClick={() => setShowTable(!showTable)}>📏 {t.sizeGuide}</button>
                  )}
                </div>

                {showTable && (
                  <table className="size-table">
                    <thead>
                      <tr>
                        <th>KR (mm)</th>
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

                <div className="options">
                  {variants.map((v, idx) => {
                    const color = isShoes ? null : colorOf(v);
                    const thumb = imagePerVariant ? images[idx]?.url : null;
                    return (
                      <button
                        key={v.id}
                        className={`opt ${thumb || color ? 'opt-color' : ''} ${
                          v.stock <= 0 ? 'off' : v.id === variantId ? 'on' : ''
                        }`}
                        disabled={v.stock <= 0}
                        onClick={() => pick(v, idx)}
                      >
                        {thumb && (
                          <span className="opt-thumb">
                            <img src={thumb} alt="" style={frameStyle(thumb)} onError={onImgError} />
                          </span>
                        )}
                        {color && <i className="dot" style={{ background: color }} />}
                        {v.label}
                      </button>
                    );
                  })}
                </div>

                {showStock ? (
                  (() => {
                    // Variant tanlangan bo'lsa — o'shaning qoldig'i, bo'lmasa jami
                    const n = variant ? variant.stock : stockTotal(product);
                    if (n <= 0) return null;
                    return n <= 3 ? (
                      <div className="stock-hint">⚡ {t.onlyLeft(n)}</div>
                    ) : (
                      <div className="stock-hint calm">📦 {t.inStockCount(n)}</div>
                    );
                  })()
                ) : (
                  variant &&
                  variant.stock > 0 &&
                  variant.stock <= 3 && <div className="stock-hint">⚡ {t.onlyLeft(variant.stock)}</div>
                )}
              </div>
            )}

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

            <ContactCard t={t} compact />
          </div>
        </div>

        <div className="sheet-cta">
          <button className="btn" onClick={add} disabled={needPick}>
            {needPick ? (
              isShoes ? t.selectFirst : t.selectOptionFirst
            ) : (
              <>
                <Icon name="bag" /> {t.addToCart} · {money(price)}
              </>
            )}
          </button>
        </div>
      </div>

      {viewer !== null && (
        <ImageViewer images={images.map((im) => im.url)} start={viewer} alt={name} onClose={() => setViewer(null)} />
      )}
    </>
  );
}
