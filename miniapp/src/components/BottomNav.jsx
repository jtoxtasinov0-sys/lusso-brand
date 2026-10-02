import { haptic } from '../telegram';
import Icon from './Icon';

// Suzib turadigan "dock": faol bo'lim oltin bo'lib kengayadi va nomi chiqadi
export default function BottomNav({ tab, setTab, cartCount, favCount, t }) {
  const items = [
    { key: 'home', icon: 'home', label: t.navHome },
    { key: 'catalog', icon: 'grid', label: t.navCatalog },
    { key: 'saved', icon: 'heart', label: t.navSaved, count: favCount },
    { key: 'cart', icon: 'bag', label: t.navCart, count: cartCount, id: 'dock-cart' },
    { key: 'profile', icon: 'user', label: t.navProfile },
  ];

  return (
    <nav className="dock">
      {items.map((i) => (
        <button
          key={i.key}
          id={i.id}
          className={tab === i.key ? 'on' : ''}
          aria-label={i.label}
          onClick={() => {
            haptic('light');
            setTab(i.key);
          }}
        >
          <Icon name={i.icon} fill={i.key === 'saved' && tab === 'saved'} />
          {i.count > 0 && (
            <span className="badge" key={i.count}>
              {i.count}
            </span>
          )}
          <span className="lbl">{i.label}</span>
        </button>
      ))}
    </nav>
  );
}
