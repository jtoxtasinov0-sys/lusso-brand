import { useEffect, useState } from 'react';
import api, { setToken } from '../api';
import { initData, isTelegram, tgUser } from '../telegram';

export default function Login({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Telegram ichida ochilgan bo'lsa — avtomatik kirishga urinamiz
  const [phase, setPhase] = useState(isTelegram ? 'telegram' : 'password');
  const [waking, setWaking] = useState(false);

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
        setPhase('password'); // Telegram tanimadi — parol bilan kirish qoladi
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
