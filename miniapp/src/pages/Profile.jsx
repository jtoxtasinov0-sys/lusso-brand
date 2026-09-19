import { haptic } from '../telegram';

export default function Profile({ t, lang, setLang, user, settings, onOrders }) {
  const name = user?.firstName || 'Mijoz';

  return (
    <div className="page">
      <div className="profile-head">
        <div className="av">{name.charAt(0).toUpperCase()}</div>
        <h2>
          {name} {user?.lastName || ''}
        </h2>
        <p>{user?.phone || (user?.username ? '@' + user.username : '')}</p>
      </div>

      <div className="menu-list">
        <button className="menu-item" onClick={onOrders}>
          <span>{t.myOrders}</span>
          <span className="arrow">›</span>
        </button>

        <div className="menu-item">
          <span>{t.language}</span>
          <div className="lang-switch">
            <button
              className={lang === 'uz' ? 'on' : ''}
              onClick={() => {
                haptic('light');
                setLang('uz');
              }}
            >
              O'zbek
            </button>
            <button
              className={lang === 'ru' ? 'on' : ''}
              onClick={() => {
                haptic('light');
                setLang('ru');
              }}
            >
              Русский
            </button>
          </div>
        </div>

        <a
          className="menu-item"
          href={`https://t.me/${settings?.supportUsername || 'lusso_brand_kr'}`}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <span>{t.support}</span>
          <span className="arrow">›</span>
        </a>
      </div>

      <div
        style={{
          marginTop: 24,
          fontSize: 13.5,
          color: '#8e8e93',
          lineHeight: 1.6,
          textAlign: 'center',
          padding: '0 10px',
        }}
      >
        {lang === 'ru' ? settings?.aboutRu : settings?.aboutUz}
      </div>

      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#c7c7cc' }}>
        LUSSO BRAND KR · v1.0
      </div>
    </div>
  );
}
