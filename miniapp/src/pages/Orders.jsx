import { useEffect, useState } from 'react';
import api from '../api';
import { money } from '../i18n';

export default function Orders({ t, lang, onBack, onReorder }) {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="screen">
      <div className="screen-head">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <h1>{t.myOrders}</h1>
      </div>

      <div className="screen-body">
        {orders === null ? (
          <>
            <div className="skel" style={{ height: 120, marginBottom: 12 }} />
            <div className="skel" style={{ height: 120 }} />
          </>
        ) : orders.length === 0 ? (
          <div className="center-empty">
            <div className="emoji">📜</div>
            <h3>{t.noOrders}</h3>
          </div>
        ) : (
          orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-top">
                <span className="order-no">{o.orderNumber}</span>
                <span className={`status ${o.status}`}>{t[o.status]}</span>
              </div>

              <div className="order-items">
                {(o.items || []).map((i, idx) => (
                  <div key={idx}>
                    • {lang === 'ru' && i.nameRu ? i.nameRu : i.name}
                    {i.variant ? ` (${i.variant})` : ''} × {i.qty}
                  </div>
                ))}
              </div>

              {o.trackingNumber && (
                <div className="track">
                  📮 {t.tracking}: <b>{o.trackingNumber}</b>
                </div>
              )}

              <div className="order-foot">
                <span className="sum">{money(o.total)}</span>
                <button onClick={() => onReorder(o)}>{t.reorder}</button>
              </div>

              <div style={{ fontSize: 11.5, color: '#c7c7cc', marginTop: 8 }}>
                {new Date(o.createdAt).toLocaleString('ru-RU')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
