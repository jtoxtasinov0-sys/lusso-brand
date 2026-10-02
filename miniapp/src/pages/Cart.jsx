import { useState } from 'react';
import { money } from '../i18n';
import { keyOf } from '../store';
import { haptic } from '../telegram';
import { PLACEHOLDER, onImgError } from '../components/ProductCard';
import { frameStyle } from '../framing';
import { colorOf } from '../colors';
import Icon from '../components/Icon';

function CartItem({ item, index, inc, dec, remove }) {
  const [leaving, setLeaving] = useState(false);
  const key = keyOf(item);

  const drop = () => {
    haptic('warning');
    setLeaving(true);
    setTimeout(() => remove(key), 320);
  };

  return (
    <div className={`cart-item rise ${leaving ? 'leaving' : ''}`} style={{ '--i': index }}>
      <img src={item.image || PLACEHOLDER} alt="" className="framed" style={frameStyle(item.image)} onError={onImgError} />
      <div className="info">
        <div className="t">{item.name}</div>
        {item.variant && item.variant !== 'Standart' && (
          <div className="v">
            {(item.color || colorOf({ label: item.variant })) && (
              <i className="dot" style={{ background: item.color || colorOf({ label: item.variant }) }} />
            )}
            {item.variant}
          </div>
        )}
        <div className="bottom">
          <div className="p">{money(item.price * item.qty)}</div>
          <div className="stepper">
            <button
              onClick={() => {
                haptic('light');
                if (item.qty <= 1) drop();
                else dec(key);
              }}
            >
              −
            </button>
            <span className="tick" key={item.qty}>
              {item.qty}
            </span>
            <button
              onClick={() => {
                haptic('light');
                inc(key);
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <button className="rm" onClick={drop} aria-label="✕">
        <Icon name="trash" />
      </button>
    </div>
  );
}

export default function Cart({
  t,
  lang,
  items,
  inc,
  dec,
  remove,
  settings,
  upsell,
  onToggleUpsell,
  upsellOn,
  goCatalog,
  onCheckout,
  orderInBrowser,
}) {
  if (!items.length) {
    return (
      <div className="page">
        <h1 className="page-title rise">{t.cartTitle}</h1>
        <div className="empty">
          <div className="em">🛍</div>
          <h3>{t.cartEmpty}</h3>
          <p>{t.cartEmptyText}</p>
          <button className="btn ghost" onClick={goCatalog}>
            {t.goCatalog}
          </button>
        </div>
      </div>
    );
  }

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeFrom = settings?.freeDeliveryFrom ?? 100000;
  const fee = subtotal >= freeFrom ? 0 : settings?.deliveryFee ?? 3000;
  const total = subtotal + fee;
  const left = freeFrom - subtotal;
  const pct = Math.min(100, Math.round((subtotal / freeFrom) * 100));

  return (
    <div className="page">
      <h1 className="page-title rise">{t.cartTitle}</h1>
      <div className="page-sub rise" style={{ '--i': 1 }}>
        {count} {t.items}
      </div>

      <div className="free-meter rise" style={{ '--i': 1 }}>
        <p>
          {left > 0 ? (
            <>
              🚚 {t.freeHint.split('{x}')[0]}
              <b>{money(left)}</b>
              {t.freeHint.split('{x}')[1]}
            </>
          ) : (
            <b>🎉 {t.freeReached}</b>
          )}
        </p>
        <div className="meter">
          <i style={{ width: pct + '%' }} />
        </div>
      </div>

      {items.map((i, idx) => (
        <CartItem key={keyOf(i)} item={i} index={idx} inc={inc} dec={dec} remove={remove} />
      ))}

      {upsell && (
        <div className="upsell rise">
          <img
            src={upsell.images?.[0]?.url || PLACEHOLDER}
            alt=""
            className="framed"
            style={frameStyle(upsell.images?.[0]?.url)}
            onError={onImgError}
          />
          <div className="txt">
            <b>{t.upsellTitle(lang === 'ru' ? upsell.nameRu : upsell.nameUz)}</b>
            {t.upsellText(money(upsell.price))}
          </div>
          <div
            className={`switch ${upsellOn ? 'on' : ''}`}
            onClick={() => {
              haptic('light');
              onToggleUpsell();
            }}
          >
            <i />
          </div>
        </div>
      )}

      <div className="summary">
        <div className="line">
          <span>{t.subtotal}</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="line">
          <span>{t.delivery} · 택배</span>
          {fee === 0 ? <span className="free">{t.free}</span> : <span>{money(fee)}</span>}
        </div>
        <div className="line total">
          <span>{t.total}</span>
          <span>{money(total)}</span>
        </div>
      </div>

      {orderInBrowser && <div className="note">🌐 {t.orderInBrowserHint}</div>}

      <div className="sticky-cta">
        <button className="btn" onClick={onCheckout}>
          {orderInBrowser ? t.orderInBrowser : t.checkout} · {money(total)}
        </button>
      </div>
    </div>
  );
}
