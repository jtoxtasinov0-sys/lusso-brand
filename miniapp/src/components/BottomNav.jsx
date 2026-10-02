import { haptic } from '../telegram';
import Icon from './Icon';

// Pastki menyu: 4 ta bo'lim + o'rtada suzib turadigan savat tugmasi
export default function BottomNav({ tab, setTab, cartCount, favCount, t }) {
  const go = (key) => {
    haptic('light');
    setTab(key);
  };

  const Item = ({ k, icon, label, count }) => (
    <button className={`nav-item ${tab === k ? 'on' : ''}`} aria-label={label} onClick={() => go(k)}>
      <span className="nav-ic">
        <Icon name={icon} fill={k === 'saved' && tab === 'saved'} />
        {count > 0 && (
          <span className="badge" key={count}>
            {count}
          </span>
        )}
      </span>
      <span className="lbl">{label}</span>
    </button>
  );

  return (
    <nav className="dock">
      <Item k="home" icon="home" label={t.navHome} />
      <Item k="catalog" icon="grid" label={t.navCatalog} />
      <div className="nav-gap" />
      <Item k="saved" icon="heart" label={t.navSaved} count={favCount} />
      <Item k="profile" icon="user" label={t.navProfile} />

      <button
        id="dock-cart"
        className={`nav-cart ${tab === 'cart' ? 'on' : ''}`}
        aria-label={t.navCart}
        onClick={() => go('cart')}
      >
        <Icon name="bag" />
        {cartCount > 0 && (
          <span className="badge" key={cartCount}>
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
