import { useEffect, useRef, useState } from 'react';
import { money } from '../i18n';
import api from '../api';
import { haptic } from '../telegram';
import { openContact } from '../components/ContactSheet';
import Icon from '../components/Icon';

// 01012345678 → 010-1234-5678
export function formatPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const phoneOk = (v) => /^01[016789]\d{7,8}$/.test(String(v).replace(/\D/g, ''));

export default function Checkout({ t, user, items, settings, onBack, onCreated }) {
  const [form, setForm] = useState({
    customerName: user?.firstName || '',
    phone: formatPhone(user?.phone || ''),
    street: '',
    detail: '',
    comment: '',
  });
  const [saveAddr, setSaveAddr] = useState(true);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const touched = useRef(new Set());

  // Qayta buyurtmada avto-to'ldirish: saqlangan manzil + oxirgi buyurtmadagi ism/telefon.
  // Mijoz yozib ulgurgan maydonga tegilmaydi.
  useEffect(() => {
    const fill = (patch) =>
      setForm((f) => {
        const next = { ...f };
        for (const [k, v] of Object.entries(patch)) {
          if (v && !touched.current.has(k) && !f[k]) next[k] = v;
        }
        return next;
      });

    api
      .addresses()
      .then((list) => {
        const a = list.find((x) => x.isDefault) || list[0];
        if (a) fill({ street: a.street, detail: a.detail || '' });
      })
      .catch(() => {});
    api
      .myOrders()
      .then((orders) => {
        const o = orders?.[0];
        if (o) {
          fill({
            customerName: o.customerName,
            phone: formatPhone(o.phone),
            street: o.street,
            detail: o.detail || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeFrom = settings?.freeDeliveryFrom ?? 100000;
  const fee = subtotal >= freeFrom ? 0 : settings?.deliveryFee ?? 3000;
  const total = subtotal + fee;

  const set = (k, transform) => (e) => {
    touched.current.add(k);
    const value = transform ? transform(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = t.required;
    if (!form.phone.trim()) e.phone = t.required;
    else if (!phoneOk(form.phone)) e.phone = t.phoneBad;
    if (!form.street.trim()) e.street = t.required;
    return e;
  };

  const submit = async () => {
    setError('');
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      haptic('error');
      const el = document.querySelector(`[name="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el?.focus(), 350);
      return;
    }

    setBusy(true);
    try {
      const res = await api.createOrder({
        ...form,
        phone: formatPhone(form.phone),
        comment: form.comment.trim(),
        saveAddress: saveAddr,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
      });
      haptic('success');
      onCreated(res);
    } catch (err) {
      setError(err.message);
      haptic('error');
    } finally {
      setBusy(false);
    }
  };

  const Field = ({ k, label, transform, ...rest }) => (
    <div className={`field ${errors[k] ? 'bad' : ''}`}>
      <label>{label}</label>
      <input name={k} value={form[k]} onChange={set(k, transform)} {...rest} />
      {errors[k] && <div className="err">{errors[k]}</div>}
    </div>
  );

  return (
    <div className="screen">
      <div className="screen-head">
        <button className="icon-btn" onClick={onBack} aria-label="←">
          <Icon name="back" />
        </button>
        <h1>{t.checkoutTitle}</h1>
      </div>

      <div className="screen-body">
        <div className="steps">
          <span className="on" />
          <span className="on" />
          <span />
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="block rise">
          <div className="block-title">
            <Icon name="user" /> {t.recipient}
          </div>
          {Field({ k: 'customerName', label: t.name, placeholder: t.namePh, autoComplete: 'name' })}
          {Field({
            k: 'phone',
            label: t.phone,
            placeholder: '010-1234-5678',
            inputMode: 'tel',
            autoComplete: 'tel',
            transform: formatPhone,
          })}
        </div>

        <div className="block rise" style={{ '--i': 1 }}>
          <div className="block-title">
            <Icon name="pin" /> {t.address}
          </div>

          <div className={`field ${errors.street ? 'bad' : ''}`}>
            <label>{t.street}</label>
            <input name="street" value={form.street} onChange={set('street')} placeholder="서울 강남구 테헤란로 123" />
            {errors.street && <div className="err">{errors.street}</div>}
          </div>

          <div className={`field ${errors.detail ? 'bad' : ''}`}>
            <label>{t.detail}</label>
            <input name="detail" value={form.detail} onChange={set('detail')} placeholder="101동 1502호" />
            {errors.detail && <div className="err">{errors.detail}</div>}
          </div>

          <div className="field">
            <textarea name="comment" value={form.comment} onChange={set('comment')} placeholder={t.comment} />
          </div>

          <div className="check" onClick={() => setSaveAddr(!saveAddr)}>
            <div className={`box ${saveAddr ? 'on' : ''}`}>{saveAddr ? '✓' : ''}</div>
            <span>{t.saveAddress}</span>
          </div>
        </div>

        <div className="eta rise" style={{ '--i': 2 }}>
          <Icon name="truck" />
          <span>{t.eta}</span>
        </div>

        <div className="summary rise" style={{ '--i': 2 }}>
          <div className="line">
            <span>
              {t.subtotal} ({items.reduce((s, i) => s + i.qty, 0)})
            </span>
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

        <button className="btn" style={{ marginTop: 18 }} onClick={submit} disabled={busy}>
          {busy ? '…' : `${t.confirm} · ${money(total)}`}
        </button>

        <button
          type="button"
          className="link-btn"
          style={{ marginTop: 12 }}
          onClick={openContact}
        >
          <Icon name="chat" /> {t.askQuestion}
        </button>
      </div>
    </div>
  );
}
