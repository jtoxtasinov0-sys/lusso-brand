import { useEffect, useState } from 'react';
import api from '../api';

export default function SettingsPage({ toast }) {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.settings().then(setS).catch((e) => toast(e.message, true));
  }, []);

  if (!s) return <div className="empty">Yuklanmoqda...</div>;

  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const updated = await api.updateSettings(s);
      setS(updated);
      toast('Saqlandi ✅');
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Sozlamalar</h1>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>🚚 Yetkazib berish</h3>

          <div className="form-row">
            <label className="label">Yetkazib berish narxi (₩)</label>
            <input className="input" type="number" value={s.deliveryFee} onChange={set('deliveryFee')} />
          </div>

          <div className="form-row">
            <label className="label">Bepul yetkazish chegarasi (₩)</label>
            <input
              className="input"
              type="number"
              value={s.freeDeliveryFrom}
              onChange={set('freeDeliveryFrom')}
            />
          </div>

          <h3 style={{ margin: '20px 0 14px', fontSize: 16 }}>💳 Bank rekvizitlari</h3>

          <div className="form-row">
            <label className="label">Bank nomi</label>
            <input className="input" value={s.bankName} onChange={set('bankName')} placeholder="Shinhan Bank" />
          </div>

          <div className="form-row">
            <label className="label">Hisob raqam</label>
            <input
              className="input"
              value={s.bankAccount}
              onChange={set('bankAccount')}
              placeholder="110-123-456789"
            />
          </div>

          <div className="form-row">
            <label className="label">Qabul qiluvchi (예금주)</label>
            <input className="input" value={s.bankHolder} onChange={set('bankHolder')} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>🏪 Do'kon</h3>

          <div className="form-row">
            <label className="label">Do'kon nomi</label>
            <input className="input" value={s.shopName} onChange={set('shopName')} />
          </div>

          <div className="form-row">
            <label className="label">Yordam uchun Telegram username (@ siz)</label>
            <input
              className="input"
              value={s.supportUsername}
              onChange={set('supportUsername')}
              placeholder="lusso_brand_kr"
            />
          </div>

          <div className="form-row">
            <label className="label">Do'kon holati</label>
            <select
              className="input"
              value={s.isOpen ? '1' : '0'}
              onChange={(e) => setS({ ...s, isOpen: e.target.value === '1' })}
            >
              <option value="1">🟢 Ochiq — buyurtma qabul qilinadi</option>
              <option value="0">🔴 Yopiq — buyurtma qabul qilinmaydi</option>
            </select>
          </div>

          <div className="form-row">
            <label className="label">Biz haqimizda (uz)</label>
            <textarea className="input" value={s.aboutUz} onChange={set('aboutUz')} />
          </div>

          <div className="form-row">
            <label className="label">О нас (ru)</label>
            <textarea className="input" value={s.aboutRu} onChange={set('aboutRu')} />
          </div>
        </div>
      </div>

      <button className="btn" style={{ marginTop: 18 }} onClick={save} disabled={busy}>
        {busy ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </>
  );
}
