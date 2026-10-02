import { useEffect, useState } from 'react';
import api from '../api';
import { money } from '../i18n';
import { haptic, openLink } from '../telegram';
import { onImgError, PLACEHOLDER } from '../components/ProductCard';
import Icon from '../components/Icon';

const FLOW = ['PENDING_PAYMENT', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function stepOf(status) {
  if (status === 'RECEIPT_SENT') return 0;
  return FLOW.indexOf(status);
}

// 운송장번호 → Naver'dagi 택배 kuzatuv (qaysi kompaniya bo'lsa ham topadi)
const trackUrl = (n) => `https://m.search.naver.com/search.naver?query=${encodeURIComponent(n + ' 택배조회')}`;

export default function Orders({ t, lang, onBack, onReorder }) {
  const [orders, setOrders] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const labels = [t.tlPaid, t.tlConfirmed, t.tlShipped, t.tlDelivered];

  return (
    <div className="screen">
      <div className="screen-head">
        <button className="icon-btn" onClick={onBack} aria-label="←">
          <Icon name="back" />
        </button>
        <h1>{t.myOrdersTitle}</h1>
      </div>

      <div className="screen-body">
        {orders === null ? (
          <>
            <div className="skel" style={{ height: 180, marginBottom: 12 }} />
            <div className="skel" style={{ height: 180 }} />
          </>
        ) : orders.length === 0 ? (
          <div className="empty">
            <div className="em">📦</div>
            <h3>{t.noOrders}</h3>
            <p>{t.noOrdersText}</p>
          </div>
        ) : (
          orders.map((o, idx) => {
            const step = stepOf(o.status);
            const cancelled = o.status === 'CANCELLED';
            return (
              <div className="order rise" style={{ '--i': idx }} key={o.id}>
                <div className="order-top">
                  <div>
                    <b>{o.orderNumber}</b>
                    <small>
                      {new Date(o.createdAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
                        timeZone: 'Asia/Seoul',
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </div>
                  <span className={`status ${o.status}`}>{t[o.status]}</span>
                </div>

                {!cancelled && (
                  <div className="timeline">
                    {labels.map((l, i) => (
                      <div
                        key={l}
                        className={`tl-step ${i <= step ? 'on' : ''} ${i === step ? 'now' : ''}`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        <i />
                        {l}
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-items" style={cancelled ? { marginTop: 14 } : undefined}>
                  {(o.items || []).map((i, k) => (
                    <img key={k} src={i.image || PLACEHOLDER} alt="" onError={onImgError} />
                  ))}
                </div>
                <div className="order-lines">
                  {(o.items || []).map((i, k) => (
                    <div key={k}>
                      {lang === 'ru' && i.nameRu ? i.nameRu : i.name}
                      {i.variant && i.variant !== 'Standart' ? ` · ${i.variant}` : ''} × {i.qty}
                    </div>
                  ))}
                </div>

                {o.trackingNumber && (
                  <div className="track">
                    <div>
                      📮 {t.tracking}
                      <b
                        onClick={() => {
                          navigator.clipboard?.writeText(o.trackingNumber).catch(() => {});
                          haptic('success');
                          setCopied(o.id);
                          setTimeout(() => setCopied(null), 1500);
                        }}
                      >
                        {o.trackingNumber} {copied === o.id ? '✓' : ''}
                      </b>
                    </div>
                    <button
                      onClick={() => {
                        haptic('light');
                        openLink(trackUrl(o.trackingNumber));
                      }}
                    >
                      {t.trackBtn}
                    </button>
                  </div>
                )}

                <div className="order-foot">
                  <span className="sum">{money(o.total)}</span>
                  <button onClick={() => onReorder(o)}>↻ {t.reorder}</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
