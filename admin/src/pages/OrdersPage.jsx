import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const money = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f1f2f4"/><text x="50%" y="52%" font-size="24" text-anchor="middle" fill="%23c9c9cf">LUSSO</text></svg>'
  );

const onImgError = (e) => {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER;
};

const STATUSES = [
  { key: 'all', label: 'Hammasi' },
  { key: 'PENDING_PAYMENT', label: "To'lov kutilmoqda" },
  { key: 'RECEIPT_SENT', label: 'Chek yuborilgan' },
  { key: 'CONFIRMED', label: 'Tasdiqlangan' },
  { key: 'SHIPPED', label: "Jo'natilgan" },
  { key: 'DELIVERED', label: 'Yetkazilgan' },
  { key: 'CANCELLED', label: 'Bekor qilingan' },
];

const LABEL = Object.fromEntries(STATUSES.map((s) => [s.key, s.label]));

export default function OrdersPage({ toast, onCountChange }) {
  const [status, setStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { order, item }

  const load = () => {
    setLoading(true);
    api
      .orders(status)
      .then((list) => {
        setOrders(list);
        if (status === 'all') {
          onCountChange?.(
            list.filter((o) => ['PENDING_PAYMENT', 'RECEIPT_SENT'].includes(o.status)).length
          );
        }
      })
      .catch((e) => toast(e.message, true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const openOrder = (o) => {
    setOpen(o);
    setTracking(o.trackingNumber || '');
  };

  const openLightbox = (order, item) => setLightbox({ order, item });

  const update = async (data) => {
    setSaving(true);
    try {
      const updated = await api.updateOrder(open.id, data);
      setOpen(updated);
      toast('Saqlandi ✅ Mijozga bot orqali xabar yuborildi');
      load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Buyurtmalar</h1>
        <button className="btn light" onClick={load}>
          ↻ Yangilash
        </button>
      </div>

      <div className="filters">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            className={`filter ${status === s.key ? 'on' : ''}`}
            onClick={() => setStatus(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="e">📦</div>
          Buyurtma yo'q
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rasm</th>
                <th>Buyurtma</th>
                <th>Mijoz</th>
                <th>Telefon</th>
                <th>Mahsulotlar</th>
                <th>Summa</th>
                <th>Holati</th>
                <th>Sana</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <img
                      className="order-thumb"
                      src={(o.items || [])[0]?.image || PLACEHOLDER}
                      alt=""
                      onError={onImgError}
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(o, (o.items || [])[0]);
                      }}
                    />
                  </td>
                  <td className="nowrap">
                    <b>{o.orderNumber}</b>
                  </td>
                  <td className="nowrap">{o.customerName}</td>
                  <td className="nowrap">{o.phone}</td>
                  <td className="muted">
                    {(o.items || [])
                      .map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ''} ×${i.qty}`)
                      .join(', ')}
                  </td>
                  <td className="nowrap">
                    <b>{money(o.total)}</b>
                  </td>
                  <td>
                    <span className={`pill ${o.status}`}>{LABEL[o.status]}</span>
                  </td>
                  <td className="muted nowrap">
                    {new Date(o.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <button className="btn sm light" onClick={() => openOrder(o)}>
                      Ochish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={`Buyurtma ${open.orderNumber}`} onClose={() => setOpen(null)} wide>
          <div className="grid-2">
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>👤 Mijoz</h4>
              <div className="info-row">
                <span>Ism</span>
                <b>{open.customerName}</b>
              </div>
              <div className="info-row">
                <span>Telefon</span>
                <b>{open.phone}</b>
              </div>
              <div className="info-row">
                <span>Telegram</span>
                <b>{open.user?.username ? '@' + open.user.username : open.user?.telegramId}</b>
              </div>

              <h4 style={{ margin: '18px 0 8px', fontSize: 14 }}>📍 Manzil</h4>
              <div className="info-row">
                <span>주소</span>
                <b style={{ textAlign: 'right' }}>{open.street}</b>
              </div>
              {open.detail && (
                <div className="info-row">
                  <span>상세 (xona)</span>
                  <b>{open.detail}</b>
                </div>
              )}
              {open.comment && (
                <div className="info-row">
                  <span>Izoh</span>
                  <b style={{ textAlign: 'right' }}>{open.comment}</b>
                </div>
              )}
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>🛍 Mahsulotlar</h4>
              <div className="order-items-list">
                {(open.items || []).map((i, idx) => (
                  <div className="order-item-row" key={idx} onClick={() => openLightbox(open, i)}>
                    <img
                      className="order-thumb sm"
                      src={i.image || PLACEHOLDER}
                      alt=""
                      onError={onImgError}
                    />
                    <div className="oi-info">
                      <span>
                        {i.name}
                        {i.variant ? ` — ${i.variant}` : ''} × {i.qty}
                      </span>
                      <b>{money(i.price * i.qty)}</b>
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-row" style={{ marginTop: 12 }}>
                <span>Yetkazib berish</span>
                <b>{open.deliveryFee === 0 ? 'BEPUL' : money(open.deliveryFee)}</b>
              </div>
              <div className="info-row">
                <span>Jami</span>
                <b style={{ fontSize: 17 }}>{money(open.total)}</b>
              </div>

              <h4 style={{ margin: '18px 0 6px', fontSize: 14 }}>🧾 To'lov cheki</h4>
              {open.receiptUrl ? (
                <a href={open.receiptUrl} target="_blank" rel="noreferrer">
                  <img className="receipt-img" src={open.receiptUrl} alt="chek" />
                </a>
              ) : (
                <div className="muted">Chek hali yuborilmagan</div>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '20px 0' }} />

          <div className="form-row">
            <label className="label">📮 Kuzatuv raqami (운송장번호)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="CJ대한통운 — 123456789012"
              />
              <button
                className="btn"
                disabled={saving}
                onClick={() => update({ trackingNumber: tracking, status: 'SHIPPED' })}
              >
                Saqlash + Jo'natildi
              </button>
            </div>
          </div>

          <label className="label">Holatni o'zgartirish (mijozga avtomatik xabar boradi)</label>
          <div className="filters" style={{ marginBottom: 0 }}>
            {STATUSES.filter((s) => s.key !== 'all').map((s) => (
              <button
                key={s.key}
                className={`filter ${open.status === s.key ? 'on' : ''}`}
                disabled={saving}
                onClick={() => update({ status: s.key })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {lightbox && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>
              ✕
            </button>
            <img
              src={lightbox.item?.image || PLACEHOLDER}
              alt=""
              onError={onImgError}
            />
            <div className="lightbox-info">
              <div className="lightbox-order">🧾 {lightbox.order.orderNumber}</div>
              <div className="lightbox-name">
                {lightbox.item?.name}
                {lightbox.item?.variant ? ` — ${lightbox.item.variant}` : ''}
              </div>

              <div className="lightbox-row">
                <span>Miqdor</span>
                <b>{lightbox.item?.qty}</b>
              </div>
              <div className="lightbox-row">
                <span>Narx</span>
                <b>{money((lightbox.item?.price || 0) * (lightbox.item?.qty || 1))}</b>
              </div>
              <div className="lightbox-row">
                <span>Mijoz</span>
                <b>{lightbox.order.customerName}</b>
              </div>
              <div className="lightbox-row">
                <span>Telefon</span>
                <b>{lightbox.order.phone}</b>
              </div>
              <div className="lightbox-row">
                <span>Manzil</span>
                <b style={{ textAlign: 'right' }}>
                  {lightbox.order.street}
                  {lightbox.order.detail ? `, ${lightbox.order.detail}` : ''}
                </b>
              </div>
              <div className="lightbox-row">
                <span>Buyurtma holati</span>
                <b>{LABEL[lightbox.order.status]}</b>
              </div>
              <div className="lightbox-row">
                <span>Buyurtma jami</span>
                <b>{money(lightbox.order.total)}</b>
              </div>

              <button
                className="btn"
                style={{ marginTop: 14, width: '100%' }}
                onClick={() => {
                  setLightbox(null);
                  openOrder(lightbox.order);
                }}
              >
                Buyurtmani to'liq ochish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
