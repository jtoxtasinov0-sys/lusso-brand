import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ADMIN logo ekrani — kamida 900 ms ko'rinadi, keyin sekin yo'qoladi
const splash = document.getElementById('splash');
if (splash) {
  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 500);
  }, Math.max(0, 900 - performance.now()));
}
