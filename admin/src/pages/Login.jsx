import { useEffect, useState } from 'react';
import api, { setToken } from '../api';
import { initData, inTelegramWithoutData, isTelegram, tgUser } from '../telegram';

export default function Login({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Telegram ichida ochilgan bo'lsa — avtomatik kirishga urinamiz.
  // Brauzerda esa avval server parol bilan kirishga ruxsat beradimi — shuni bilamiz.
  const [phase, setPhase] = useState(isTelegram ? 'telegram' : 'checking');
  const [waking, setWaking] = useState(false);
  const [browserAllowed, setBrowserAllowed] = useState(false);
  const [botUrl, setBotUrl] = useState(null);

  // Brauzer kirishi yoqilganmi (server sozlamasi: BROWSER_ACCESS)
  useEffect(() => {
    let alive = true;
    const check = (second = false) =>
      api
        .health()
        .then((h) => {
          if (!alive) return;
          setBrowserAllowed(Boolean(h?.browser));
          setBotUrl(h?.botUrl || null);
          if (!isTelegram) setPhase(h?.browser ? 'password' : 'bot-only');
        })
        .catch(() => {
          if (!alive) return;
          if (!second) return check(true); // server uyg'onayotgan bo'lishi mumkin
          if (!isTelegram) setPhase('bot-only');
        });
    check();
    return () => {
      alive = false;
    };
  }, []);

  const enter = (res) => {
    setToken(res.token);
    onDone();
  };

  // ---- Telegram orqali (parolsiz) ----
  useEffect(() => {
    if (!isTelegram) return;
    let alive = true;

    const attempt = async (second = false) => {
      try {
        const res = await api.loginWithTelegram(initData);
        if (alive) enter(res);
      } catch (err) {
        if (!alive) return;

        // Render bepul tarifda uxlab qoladi: birinchi so'rov uni uyg'otadi,
        // ikkinchisi o'tib ketadi
        if (!second && (err.code === 'NETWORK' || err.code === 'WAKING')) {
          setWaking(true);
          await api.health().catch(() => {});
          if (alive) await attempt(true);
          return;
        }

        setError(err.message);
        setPhase('password'); // Telegram tanimadi — xato (va ruxsat bo'lsa parol) ko'rsatiladi
      }
    };

    attempt();

    return () => {
      alive = false;
    };
  }, []);

  // ---- Parol bilan ----
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      enter(await api.login(password));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'telegram') {
    const name = tgUser()?.first_name || '';
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div className="logo">LUSSO BRAND KR</div>
          <div className="sub">Admin panel</div>
          <div className="login-hint">
            {waking
              ? "Server uyg'onmoqda, biroz kuting..."
              : name
                ? `${name}, kirmoqdasiz...`
                : 'Kirmoqdasiz...'}
            <br />
            Bu 30–50 soniya davom etishi mumkin.
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'checking') {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div className="logo">LUSSO BRAND KR</div>
          <div className="sub">Admin panel</div>
          <div className="login-hint">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  // Brauzer kirishi o'chiq: panel faqat bot ichida ochiladi
  if (phase === 'bot-only' || (phase === 'password' && !browserAllowed)) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div className="logo">LUSSO BRAND KR</div>
          <div className="sub">Admin panel</div>
          {error && <div className="login-error">{error}</div>}
          <div className="login-hint" style={{ marginTop: 14 }}>
            {isTelegram ? (
              <>
                Telegram sizni admin sifatida tanimadi. Botga <b>/admin PAROL</b> deb yozing va
                panelni qaytadan oching.
              </>
            ) : inTelegramWithoutData ? (
              <>Telegram ma'lumoti kelmadi. Panelni yopib, botdagi tugma orqali qaytadan oching.</>
            ) : (
              <>
                Admin panel faqat Telegram bot ichida ishlaydi. Botga <b>/panel</b> deb yozing va
                chiqqan tugma orqali oching.
              </>
            )}
          </div>
          {!isTelegram && !inTelegramWithoutData && botUrl && (
            <a className="btn full" style={{ marginTop: 16, textDecoration: 'none' }} href={botUrl}>
              Telegram botni ochish
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="logo">LUSSO BRAND KR</div>
        <div className="sub">Admin panel</div>

        <input
          className="input"
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {error && <div className="login-error">{error}</div>}

        <button className="btn full" style={{ marginTop: 16 }} disabled={busy}>
          {busy ? 'Tekshirilmoqda...' : 'Kirish'}
        </button>

        {isTelegram && (
          <div className="login-hint" style={{ marginTop: 14 }}>
            Telegram sizni admin sifatida tanimadi. Botga <b>/admin PAROL</b> deb yozing va
            panelni qaytadan oching.
          </div>
        )}
      </form>
    </div>
  );
}
