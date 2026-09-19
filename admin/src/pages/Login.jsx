import { useState } from 'react';
import api, { setToken } from '../api';

export default function Login({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.login(password);
      setToken(res.token);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

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

        {error && (
          <div style={{ color: '#dc2626', fontSize: 13.5, marginTop: 10 }}>{error}</div>
        )}

        <button className="btn full" style={{ marginTop: 16 }} disabled={busy}>
          {busy ? '...' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}
