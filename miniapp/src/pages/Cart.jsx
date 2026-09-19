import { money } from '../i18n';
import { keyOf } from '../store';
import { haptic } from '../telegram';
import { onImgError } from '../components/ProductCard';

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
}) {
  if (!items.length) {
    return (
      <div className="page">
        <div className="header">
          <div className="name">{t.cartTitle}</div>
        </div>
        <div className="center-empty">
          <div className="emoji">🛒</div>
          <h3>{t.cartEmpty}</h3>
          <p>{t.cartEmptyText}</p>
          <button className="btn btn-light" onClick={goCatalog}>
            {t.goCatalog}
          </button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeFrom = settings?.freeDeliveryFrom ?? 100000;
  const fee = subtotal >= freeFrom ? 0 : settings?.deliveryFee ?? 3500;
  const total = subtotal + fee;
  const left = freeFrom - subtotal;

  return (
    <div className="page">
      <div className="header">
        <div className="name">{t.cartTitle}</div>
      </div>

      {items.map((i) => (
        <div className="cart-item" key={keyOf(i)}>
          <img src={i.image} alt="" onError={onImgError} />
          <div className="info">
            <div className="t">{i.name}</div>
            {i.variant && <div className="v">{i.variant}</div>}
            <div className="qty">
              <button
                onClick={() => {
                  haptic('light');
                  dec(keyOf(i));
                }}
              >
                −
              </button>
              <span>{i.qty}</span>
              <button
                onClick={() => {
                  haptic('light');
                  inc(keyOf(i));
                }}
              >
                +
              </button>
              <button style={{ marginLeft: 'auto' }} onClick={() => remove(keyOf(i))}>
                🗑
              </button>
            </div>
          </div>
          <div className="p">{money(i.price * i.qty)}</div>
        </div>
      ))}

      {upsell && (
        <div className="upsell">
          <div className="txt">
            <b>
              {lang === 'ru'
                ? `Добавить ${upsell.nameRu}?`
                : `${upsell.nameUz} ni ham qo'shasizmi?`}
            </b>
            {lang === 'ru'
              ? `Всего ${money(upsell.price)} — отличный подарок`
              : `Atigi ${money(upsell.price)} — ajoyib sovg'a bo'ladi`}
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
          <span>{t.delivery}</span>
          <span style={fee === 0 ? { color: '#21b573', fontWeight: 700 } : {}}>
            {fee === 0 ? t.free : money(fee)}
          </span>
        </div>
        <div className="line total">
          <span>{t.total}</span>
          <span>{money(total)}</span>
        </div>
      </div>

      {left > 0 && <div className="free-hint">🚚 {t.freeHint(money(left))}</div>}

      <div className="sticky-bottom">
        <button className="btn" onClick={onCheckout}>
          {t.checkout} — {money(total)}
        </button>
      </div>
    </div>
  );
}
