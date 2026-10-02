// Animatsiya yordamchilari

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Mahsulot rasmini pastdagi savat tugmasiga "uchirib" boradi.
 * fromEl — bosilgan kartadagi <img>. Savat tugmasi id="dock-cart".
 */
export function flyToCart(fromEl) {
  const target = document.getElementById('dock-cart');
  if (!fromEl || !target || reduced() || !fromEl.animate) {
    bumpCart();
    return;
  }

  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (!a.width) {
    bumpCart();
    return;
  }

  const ghost = document.createElement('img');
  ghost.src = fromEl.currentSrc || fromEl.src;
  ghost.className = 'fly';
  Object.assign(ghost.style, {
    left: a.left + 'px',
    top: a.top + 'px',
    width: a.width + 'px',
    height: a.height + 'px',
  });
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  const anim = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '16px' },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.15 - 80}px) scale(0.55) rotate(-10deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08) rotate(20deg)`, opacity: 0.4, borderRadius: '50%' },
    ],
    { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }
  );
  anim.onfinish = () => {
    ghost.remove();
    bumpCart();
  };
}

export function bumpCart() {
  const el = document.getElementById('dock-cart');
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth; // animatsiyani qayta ishga tushirish
  el.classList.add('bump');
}
