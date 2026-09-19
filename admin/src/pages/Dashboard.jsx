import { useEffect, useState } from 'react';
import api from '../api';

const money = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

// Hali o'zgartirilmagan (test) rekvizitlar
const TEST_ACCOUNTS = ['1234-5678-9012', '110-000-000000', '110-123-456789', ''];

export default function Dashboard({ toast, onGoSettings }) {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.stats().then(setData).catch((e) => toast(e.message, true));
    api.settings().then(setSettings).catch(() => {});
  }, []);

  if (!data) return <div className="empty">Yuklanmoqda...</div>;

  const bankNotReady = settings && TEST_ACCOUNTS.includes((settings.bankAccount || '').trim());

  return (
    <>
      <div className="page-head">
        <h1>Boshqaruv paneli</h1>
      </div>

      {bankNotReady && (
        <div
          className="card"
          style={{
            background: '#fff7e8',
            borderColor: '#f5d9a8',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 22 }}>⚠️</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <b style={{ display: 'block', marginBottom: 2 }}>
              Bank hisob raqami hali test holatida
            </b>
            <span className="muted">
              Hozir mijozlarga <b>{settings.bankAccount || '—'}</b> ko'rsatilyapti. Haqiqiy savdoni
              boshlashdan oldin o'zgartiring — aks holda to'lovlar sizga yetib bormaydi.
            </span>
          </div>
          <button className="btn" onClick={onGoSettings}>
            Sozlamalarga o'tish
          </button>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <div className="t">Bugungi buyurtmalar</div>
          <div className="v">{data.todayOrders}</div>
          <div className="s">{money(data.todayRevenue)} bugun</div>
        </div>
        <div className="stat">
          <div className="t">Kutilayotgan to'lovlar</div>
          <div className="v" style={{ color: data.pendingOrders ? '#d97706' : undefined }}>
            {data.pendingOrders}
          </div>
          <div className="s">tekshirish kerak</div>
        </div>
        <div className="stat">
          <div className="t">Jami buyurtmalar</div>
          <div className="v">{data.totalOrders}</div>
        </div>
        <div className="stat">
          <div className="t">Jami tushum</div>
          <div className="v">{money(data.revenue)}</div>
          <div className="s">tasdiqlanganlar bo'yicha</div>
        </div>
        <div className="stat">
          <div className="t">Mijozlar</div>
          <div className="v">{data.totalUsers}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>🔥 Eng ko'p sotilganlar</h3>
          {data.topProducts.length === 0 ? (
            <div className="muted">Hali sotuv yo'q</div>
          ) : (
            data.topProducts.map((p) => (
              <div className="info-row" key={p.name}>
                <span style={{ color: 'var(--text)' }}>{p.name}</span>
                <b>
                  {p.qty} ta · {money(p.sum)}
                </b>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>⚠️ Tugayotgan zaxira</h3>
          {data.lowStock.length === 0 ? (
            <div className="muted">Hammasi yetarli</div>
          ) : (
            data.lowStock.map((v, i) => (
              <div className="info-row" key={i}>
                <span style={{ color: 'var(--text)' }}>
                  {v.product} — {v.label}
                </span>
                <b style={{ color: v.stock === 0 ? '#dc2626' : '#d97706' }}>{v.stock} ta</b>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
