import { useEffect, useState } from 'react';
import api from '../api';
import ImageUploader from '../components/ImageUploader';

export default function BroadcastPage({ toast }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState(0);

  const load = () => {
    api.broadcastHistory().then(setHistory).catch(() => {});
    api.users().then((list) => setUsers(list.length)).catch(() => {});
  };

  useEffect(load, []);

  const send = async () => {
    if (!text.trim()) return toast('Matn kiriting', true);
    if (!confirm(`Xabar ${users} ta mijozga yuborilsinmi?`)) return;

    setBusy(true);
    try {
      const res = await api.broadcast({
        text,
        imageUrl: images[0] || null,
        buttonText: buttonText || null,
        buttonUrl: buttonUrl || null,
      });
      toast(`Yuborildi ✅ ${res.sent} ta yetdi, ${res.failed} ta yetmadi`);
      setText('');
      setImages([]);
      setButtonText('');
      setButtonUrl('');
      load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Rassilka</h1>
        <span className="muted">{users} ta mijozga yuboriladi</span>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="form-row">
            <label className="label">Xabar matni *</label>
            <textarea
              className="input"
              style={{ height: 140 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"🔥 Yangi kolleksiya keldi!\n\nBarcha krossovkalarga -30% chegirma.\nFaqat shu hafta!"}
            />
          </div>

          <div className="form-row">
            <label className="label">Rasm (ixtiyoriy)</label>
            <ImageUploader images={images} onChange={setImages} onError={(m) => toast(m, true)} />
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label">Tugma matni</label>
              <input
                className="input"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="🛍 Do'konni ochish"
              />
            </div>
            <div className="form-row">
              <label className="label">Tugma havolasi</label>
              <input
                className="input"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://t.me/lusso_brand_kr_bot"
              />
            </div>
          </div>

          <button className="btn full" onClick={send} disabled={busy}>
            {busy ? 'Yuborilmoqda... (biroz vaqt oladi)' : '📢 Hammaga yuborish'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Tarix</h3>
          {history.length === 0 ? (
            <div className="muted">Hali rassilka yuborilmagan</div>
          ) : (
            history.map((h) => (
              <div key={h.id} style={{ borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
                <div style={{ fontSize: 13.5, marginBottom: 4 }}>
                  {h.text.slice(0, 90)}
                  {h.text.length > 90 ? '...' : ''}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  ✅ {h.sentCount} · ❌ {h.failCount} ·{' '}
                  {new Date(h.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
