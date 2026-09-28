import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import BotOnly from './components/BotOnly';
import { initTelegram, isTelegram } from './telegram';
import { hideSplash } from './splash';

// iOS'da Telegram mini-ilovani qayta ochganda sahifani "bfcache"dan
// (avvalgi holatidan) tiklab qo'yishi mumkin — bunda Telegram yangi
// initData'ni sahifaga qayta yubormaydi va u butunlay bo'sh qolib
// ketadi. Shu holatni aniqlab, sahifani majburan qayta yuklaymiz —
// shunda Telegram initData'ni yangidan to'g'ri beradi.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});

initTelegram();

const root = ReactDOM.createRoot(document.getElementById('root'));

function renderShop() {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (isTelegram()) {
  renderShop();
} else {
  // Oddiy brauzer: server brauzer kirishiga ruxsat bergan bo'lsagina do'kon ochiladi,
  // aks holda mijoz Telegram botga yo'naltiriladi
  // Server uxlab yotgan bo'lsa birinchi so'rov xato berishi mumkin — bir marta qayta so'raymiz
  const getAccess = () =>
    fetch('/api/client/access').then((r) => (r.ok ? r.json() : Promise.reject()));
  getAccess()
    .catch(() => getAccess())
    .then((access) => {
      if (access.browser) return renderShop();
      root.render(<BotOnly botUrl={access.botUrl} />);
      hideSplash();
    })
    .catch(() => {
      root.render(<BotOnly botUrl={null} />);
      hideSplash();
    });
}
