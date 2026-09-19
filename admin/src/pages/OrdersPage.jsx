import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const money = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

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
                  <div key={idx}>
                    • {i.name}
                    {i.variant ? ` — ${i.variant}` : ''} × {i.qty} = <b>{money(i.price * i.qty)}</b>
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
    </>
  );
}
