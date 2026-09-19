import { haptic } from '../telegram';

export default function BottomNav({ tab, setTab, cartCount, t }) {
  const items = [
    { key: 'home', icon: '🏠', label: t.navHome },
    { key: 'catalog', icon: '🔍', label: t.navCatalog },
    { key: 'cart', icon: '🛒', label: t.navCart },
    { key: 'profile', icon: '👤', label: t.navProfile },
  ];

  return (
    <nav className="nav">
      {items.map((i) => (
        <button
          key={i.key}
          className={tab === i.key ? 'on' : ''}
          onClick={() => {
            haptic('light');
            setTab(i.key);
          }}
        >
          <span className="ic">{i.icon}</span>
          {i.key === 'cart' && cartCount > 0 && <span className="dot">{cartCount}</span>}
          {i.label}
        </button>
      ))}
    </nav>
  );
}
