import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { initTelegram } from './telegram';

// iOS'da Telegram mini-ilovani qayta ochganda sahifani "bfcache"dan
// (avvalgi holatidan) tiklab qo'yishi mumkin — bunda Telegram yangi
// initData'ni sahifaga qayta yubormaydi va u butunlay bo'sh qolib
// ketadi. Shu holatni aniqlab, sahifani majburan qayta yuklaymiz —
// shunda Telegram initData'ni yangidan to'g'ri beradi.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});

initTelegram();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
