// miniapp/src/framing.js bilan bir xil format — o'zgartirsangiz ikkalasini ham yangilang.
// Rasm ramkasi: shu panelda har bir rasm uchun kattalik va joylashuv tanlanadi.
// Sozlama rasm havolasining "#" qismida saqlanadi: ".../shoe.jpg#z=1.3&x=50&y=40&fit=c"
//   z   — kattalashtirish (1 = ramkani to'liq to'ldiradi)
//   x,y — rasmning qaysi qismi markazda turadi (0–100 %)
//   fit — "c" bo'lsa rasm to'liq ko'rinadi (kesilmaydi)
// "#" qismi serverga yuborilmaydi, shuning uchun rasmning o'zi o'zgarmaydi.

export function parseFrame(url = '') {
  const [src, hash = ''] = String(url).split('#');
  const q = new URLSearchParams(hash);
  const num = (k, d) => {
    const n = parseFloat(q.get(k));
    return Number.isFinite(n) ? n : d;
  };
  return {
    src,
    z: num('z', 1),
    x: num('x', 50),
    y: num('y', 50),
    fit: q.get('fit') === 'c' ? 'contain' : 'cover',
  };
}

// <img> uchun style: object-fit/position + kattalashtirish (--z CSS o'zgaruvchisi orqali)
export function frameStyle(url) {
  const f = parseFrame(url);
  return {
    objectFit: f.fit,
    objectPosition: `${f.x}% ${f.y}%`,
    transformOrigin: `${f.x}% ${f.y}%`,
    '--z': f.z,
  };
}

// Sozlamani havolaga yozish. Standart holat (z=1, markaz, cover) bo'lsa "#" qismi olib tashlanadi.
export function buildFrame(src, { z = 1, x = 50, y = 50, fit = 'cover' } = {}) {
  const r = (n, d = 0) => Number(n.toFixed(d));
  const parts = [];
  if (Math.abs(z - 1) > 0.005) parts.push(`z=${r(z, 2)}`);
  if (Math.round(x) !== 50) parts.push(`x=${r(x)}`);
  if (Math.round(y) !== 50) parts.push(`y=${r(y)}`);
  if (fit === 'contain') parts.push('fit=c');
  return parts.length ? `${src}#${parts.join('&')}` : src;
}
