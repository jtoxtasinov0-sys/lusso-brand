import { useEffect, useState } from 'react';
import api from '../api';

// Panel qaysi manzilda ochilgan bo'lsa — boshqa odamga yuboriladigan manzil shu
const PANEL_URL = window.location.origin;

// Telegram ichida clipboard har doim ham ishlamaydi — zaxira usul bilan
function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  } catch {
    /* quyidagi usulga o'tamiz */
  }
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export default function SettingsPage({ toast }) {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.settings().then(setS).catch((e) => toast(e.message, true));
  }, []);

  if (!s) return <div className="empty">Yuklanmoqda...</div>;

  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  const copy = (text, label) =>
    copyText(text)
      .then(() => toast(label + ' nusxa olindi ✅'))
      .catch(() => toast('Nusxa olinmadi — qo\'lda belgilab oling', true));

  const invite =
    `Admin panel:\n${PANEL_URL}\n` +
    `Parol: ${s?.panelPassword?.trim() || '(serverdagi standart parol)'}`;

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

      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>🔐 Panelga kirish</h3>
        <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Boshqa odam panelga brauzerdan kirishi uchun quyidagi manzil va parolni yuboring.
          Parolni istalgan vaqtda o'zgartirsangiz, eskisi darhol ishlamay qoladi.
        </div>

        <div className="form-row">
          <label className="label">Panel manzili</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={PANEL_URL} readOnly />
            <button className="btn light" type="button" onClick={() => copy(PANEL_URL, 'Manzil')}>
              Nusxa
            </button>
          </div>
        </div>

        <div className="form-row">
          <label className="label">Panel paroli</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={s.panelPassword || ''}
              onChange={set('panelPassword')}
              placeholder="Bo'sh — serverdagi standart parol ishlaydi"
            />
            <button
              className="btn light"
              type="button"
              disabled={!s.panelPassword}
              onClick={() => copy(s.panelPassword, 'Parol')}
            >
              Nusxa
            </button>
          </div>
        </div>

        <button className="btn light" type="button" onClick={() => copy(invite, 'Xabar')}>
          📋 Manzil va parolni birga nusxalash
        </button>

        <div className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
          ⚠️ Yangi parol <b>Saqlash</b> tugmasi bosilgandan keyin kuchga kiradi. Siz botdan
          kirganingizda parol so'ralmaydi — bu parol faqat brauzerdan kiradiganlar uchun.
        </div>
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

        <div className="card">
          <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>🔗 Mini App / Admin panel manzillari</h3>
          <p className="muted" style={{ marginTop: 0, fontSize: 12.5 }}>
            Render/Vercel'dagi doimiy manzil har doim avtomatik ustuvor bo'ladi — bu yerlar
            faqat qo'lda boshqa manzil sinab ko'rish yoki eski qiymatni tozalash uchun,
            odatda bo'sh qoldirsangiz ham bo'laveradi.
          </p>

          <div className="form-row">
            <label className="label">Mini App manzili (webAppUrl)</label>
            <input
              className="input"
              value={s.webAppUrl || ''}
              onChange={set('webAppUrl')}
              placeholder="https://lusso-miniapp.vercel.app"
            />
          </div>

          <div className="form-row">
            <label className="label">Admin panel manzili (adminUrl)</label>
            <input
              className="input"
              value={s.adminUrl || ''}
              onChange={set('adminUrl')}
              placeholder="https://lusso-admin-sand.vercel.app"
            />
          </div>
        </div>
      </div>

      <button className="btn" style={{ marginTop: 18 }} onClick={save} disabled={busy}>
        {busy ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </>
  );
}
