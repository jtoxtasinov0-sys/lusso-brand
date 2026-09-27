// Logo ekrani (index.html dagi #splash) — birinchi ma'lumotlar kelgach yashiriladi.
// Juda tez yo'qolib "miltillab" qolmasligi uchun kamida MIN_MS ko'rsatiladi.
const MIN_MS = 1100;
const MAX_MS = 5000; // internet sekin bo'lsa ham ilova shu vaqtdan keyin ochiladi

let hidden = false;

export function hideSplash() {
  if (hidden) return;
  hidden = true;
  const el = document.getElementById('splash');
  if (!el) return;
  const wait = Math.max(0, MIN_MS - performance.now());
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 500);
  }, wait);
}

setTimeout(hideSplash, MAX_MS);
