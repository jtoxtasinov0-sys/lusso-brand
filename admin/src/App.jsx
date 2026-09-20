import { useEffect, useState } from 'react';
import api, { getToken, setToken } from './api';
import { initTelegram, isTelegram, tg } from './telegram';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import ContentPage from './pages/ContentPage';
import UsersPage from './pages/UsersPage';
import BroadcastPage from './pages/BroadcastPage';
import SettingsPage from './pages/SettingsPage';

const MENU = [
  { key: 'dashboard', icon: '📊', label: 'Boshqaruv' },
  { key: 'orders', icon: '📦', label: 'Buyurtmalar' },
  { key: 'products', icon: '🛍', label: 'Mahsulotlar' },
  { key: 'content', icon: '📸', label: 'Story / Kategoriya' },
  { key: 'users', icon: '👥', label: 'Mijozlar' },
  { key: 'broadcast', icon: '📢', label: 'Rassilka' },
  { key: 'settings', icon: '⚙️', label: 'Sozlamalar' },
];

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [page, setPage] = useState('dashboard');
  const [pending, setPending] = useState(0);
  const [toast, setToast] = useState(null);

  // Telegram ichida ochilgan bo'lsa — oynani to'liq ekranga yoyamiz
  useEffect(() => {
    initTelegram();
  }, []);

  const showToast = (text, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3200);
  };

  // Yangi buyurtmalar sonini davriy tekshirish
  useEffect(() => {
    if (!authed) return;
    const check = () =>
      api
        .orders()
        .then((list) =>
          setPending(
            list.filter((o) => ['PENDING_PAYMENT', 'RECEIPT_SENT'].includes(o.status)).length
          )
        )
        .catch(() => {});
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, [authed, page]);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  const props = { toast: showToast };

  const leave = () => {
    if (isTelegram) {
      tg?.close();
      return;
    }
    setToken('');
    setAuthed(false);
  };

  return (
    <div className={`layout${isTelegram ? ' in-telegram' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          LUSSO BRAND
          <small>KR · Admin panel</small>
        </div>

        {MENU.map((m) => (
          <button
            key={m.key}
            className={`side-btn ${page === m.key ? 'on' : ''}`}
            onClick={() => setPage(m.key)}
          >
            <span>{m.icon}</span>
            <span className="txt">{m.label}</span>
            {m.key === 'orders' && pending > 0 && <span className="badge-count">{pending}</span>}
          </button>
        ))}

        <button className="side-btn leave" onClick={leave}>
          <span>🚪</span>
          <span className="txt">{isTelegram ? 'Yopish' : 'Chiqish'}</span>
        </button>
      </aside>

      <main className="main">
        {page === 'dashboard' && <Dashboard {...props} onGoSettings={() => setPage('settings')} />}
        {page === 'orders' && <OrdersPage {...props} onCountChange={setPending} />}
        {page === 'products' && <ProductsPage {...props} />}
        {page === 'content' && <ContentPage {...props} />}
        {page === 'users' && <UsersPage {...props} />}
        {page === 'broadcast' && <BroadcastPage {...props} />}
        {page === 'settings' && <SettingsPage {...props} />}
      </main>

      {toast && <div className={`toast ${toast.isError ? 'err' : ''}`}>{toast.text}</div>}
    </div>
  );
}
