import { haptic, openLink } from '../telegram';
import { SUPPORT_URL } from '../constants';
import { useFav } from '../store';
import Icon from '../components/Icon';

export default function Profile({ t, lang, setLang, user, settings, onOrders, onSaved }) {
  const name = user?.firstName || t.guest;
  const favCount = useFav((s) => s.ids.length);

  const Row = ({ icon, label, onClick, right }) => (
    <button
      className="menu-item"
      onClick={() => {
        haptic('light');
        onClick?.();
      }}
    >
      <span className="mi">
        <Icon name={icon} />
      </span>
      <span className="grow">{label}</span>
      {right ?? (
        <span className="arrow">
          <Icon name="next" />
        </span>
      )}
    </button>
  );

  return (
    <div className="page">
      <h1 className="page-title rise">{t.profile}</h1>

      <div className="profile-card rise" style={{ '--i': 1 }}>
        <div className="av">{name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>
            {name} {user?.lastName || ''}
          </h2>
          <p>{user?.phone || (user?.username ? '@' + user.username : t.welcomeMember)}</p>
          <span className="tier">LUSSO MEMBER</span>
        </div>
      </div>

      <div className="menu rise" style={{ '--i': 2 }}>
        <Row icon="receipt" label={t.myOrders} onClick={onOrders} />
        <Row icon="heart" label={t.savedTitle} onClick={onSaved} right={<span className="val">{favCount}</span>} />
        <div className="menu-item">
          <span className="mi">
            <Icon name="globe" />
          </span>
          <span className="grow">{t.language}</span>
          <div className="lang-switch">
            {[
              ['uz', "O'zb"],
              ['ru', 'Рус'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={lang === k ? 'on' : ''}
                onClick={() => {
                  haptic('light');
                  setLang(k);
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu rise" style={{ '--i': 3 }}>
        <Row icon="chat" label={t.support} onClick={() => openLink(SUPPORT_URL)} />
        <Row
          icon="truck"
          label={t.deliveryInfo}
          onClick={() => {}}
          right={<span className="val">₩{Number(settings?.freeDeliveryFrom ?? 100000).toLocaleString('ko-KR')}+ {t.free}</span>}
        />
        <Row icon="shield" label={t.securePay} onClick={() => {}} right={<span className="val">{settings?.bankName || '계좌이체'}</span>} />
      </div>

      <div className="about">{lang === 'ru' ? settings?.aboutRu : settings?.aboutUz}</div>
      <div className="version">LUSSO BRAND KR · 2.0</div>
    </div>
  );
}
