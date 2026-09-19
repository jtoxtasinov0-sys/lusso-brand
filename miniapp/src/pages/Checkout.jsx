import { useEffect, useState } from 'react';
import { money } from '../i18n';
import api from '../api';
import { haptic } from '../telegram';

export default function Checkout({ t, user, items, settings, onBack, onCreated }) {
  const [form, setForm] = useState({
    customerName: user?.firstName || '',
    phone: user?.phone || '',
    street: '',
    detail: '',
    comment: '',
  });
  const [saveAddr, setSaveAddr] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .addresses()
      .then((list) => {
        const a = list.find((x) => x.isDefault) || list[0];
        if (a) {
          setForm((f) => ({ ...f, street: a.street, detail: a.detail || '' }));
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeFrom = settings?.freeDeliveryFrom ?? 100000;
  const fee = subtotal >= freeFrom ? 0 : settings?.deliveryFee ?? 3500;
  const total = subtotal + fee;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.customerName || !form.phone || !form.street) {
      setError(t.fillAll);
      haptic('error');
      return;
    }
    setBusy(true);
    try {
      const res = await api.createOrder({
        ...form,
        saveAddress: saveAddr,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          qty: i.qty,
        })),
      });
      haptic('success');
      onCreated(res);
    } catch (e) {
      setError(e.message);
      haptic('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-head">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <h1>{t.checkoutTitle}</h1>
      </div>

      <div className="screen-body">
        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label>{t.name}</label>
          <input value={form.customerName} onChange={set('customerName')} placeholder="Ism Familiya" />
        </div>

        <div className="field">
          <label>{t.phone}</label>
          <input
            value={form.phone}
            onChange={set('phone')}
            placeholder="010-1234-5678"
            inputMode="tel"
          />
        </div>

        <div className="field">
          <label>{t.street}</label>
          <input
            value={form.street}
            onChange={set('street')}
            placeholder="서울시 강남구 테헤란로 123"
          />
        </div>

        <div className="field">
          <label>{t.detail}</label>
          <input value={form.detail} onChange={set('detail')} placeholder="101동 1502호" />
        </div>

        <div className="field">
          <label>{t.comment}</label>
          <textarea value={form.comment} onChange={set('comment')} />
        </div>

        <div className="check" onClick={() => setSaveAddr(!saveAddr)}>
          <div className={`box ${saveAddr ? 'on' : ''}`}>{saveAddr ? '✓' : ''}</div>
          <span>{t.saveAddress}</span>
        </div>

        <div className="summary">
          <div className="line">
            <span>{t.subtotal}</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="line">
            <span>{t.delivery}</span>
            <span>{fee === 0 ? t.free : money(fee)}</span>
          </div>
          <div className="line total">
            <span>{t.total}</span>
            <span>{money(total)}</span>
          </div>
        </div>

        <button className="btn" style={{ marginTop: 18 }} onClick={submit} disabled={busy}>
          {busy ? '...' : `${t.confirm} — ${money(total)}`}
        </button>
      </div>
    </div>
  );
}
