import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const LOW = 3; // shundan kam qolsa — "kam qolgan"

// Ombor: har bir mahsulot variantida nechta tovar borligini kiritish
export default function StockPage({ toast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState({}); // { variantId: yangi son }
  const [catId, setCatId] = useState('all');
  const [filter, setFilter] = useState('all'); // all | low | out
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.products().then(setProducts).catch((e) => toast(e.message, true));
    api.categories().then(setCategories).catch(() => {});
    api.settings().then(setSettings).catch(() => {});
  };

  useEffect(load, []);

  const stockOf = (v) => (draft[v.id] !== undefined ? draft[v.id] : v.stock);

  const setStock = (v, value) => {
    const n = value === '' ? '' : Math.max(0, Math.floor(Number(value) || 0));
    setDraft((d) => {
      const next = { ...d, [v.id]: n };
      if (n === v.stock) delete next[v.id];
      return next;
    });
  };

  const bump = (v, delta) => setStock(v, Math.max(0, (Number(stockOf(v)) || 0) + delta));

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (catId !== 'all' && p.categoryId !== Number(catId)) return false;
      if (q && ![p.nameUz, p.nameRu, p.brand].some((s) => s?.toLowerCase().includes(q))) return false;
      const vs = p.variants || [];
      if (filter === 'out') return vs.some((v) => v.stock <= 0);
      if (filter === 'low') return vs.some((v) => v.stock <= LOW);
      return true;
    });
  }, [products, catId, filter, query]);

  const totals = useMemo(() => {
    const all = products.flatMap((p) => p.variants || []);
    return {
      units: all.reduce((s, v) => s + Math.max(0, v.stock), 0),
      low: all.filter((v) => v.stock > 0 && v.stock <= LOW).length,
      out: all.filter((v) => v.stock <= 0).length,
    };
  }, [products]);

  const dirty = Object.keys(draft).length;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await api.updateStock(Object.entries(draft).map(([id, stock]) => ({ id: Number(id), stock: Number(stock) || 0 })));
      toast('Ombor saqlandi ✅');
      setDraft({});
      load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = async () => {
    const showStock = !settings?.showStock;
    try {
      setSettings(await api.updateSettings({ showStock }));
      toast(showStock ? "Mijozlarga qoldiq ko'rsatiladi ✅" : 'Qoldiq mijozlardan yashirildi');
    } catch (e) {
      toast(e.message, true);
    }
  };

  return (
    <div className={`stock-page ${dirty ? 'has-save' : ''}`}>
      <div className="page-head">
        <h1>Ombor</h1>
      </div>

      <div className="card">
        <div className="stock-summary">
          <div>
            <b>{totals.units}</b>
            <span>jami tovar</span>
          </div>
          <div>
            <b style={{ color: '#d97706' }}>{totals.low}</b>
            <span>kam qolgan</span>
          </div>
          <div>
            <b style={{ color: '#dc2626' }}>{totals.out}</b>
            <span>tugagan</span>
          </div>
        </div>

        {settings && (
          <label className="stock-toggle">
            <input type="checkbox" checked={Boolean(settings.showStock)} onChange={toggleShow} />
            <span>Mijozlarga nechta qolgani ko'rinsin</span>
          </label>
        )}
      </div>

      <div className="card">
        <input
          className="input"
          placeholder="🔍 Mahsulot qidirish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid-2" style={{ marginTop: 10 }}>
          <select className="input" value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nameUz}
              </option>
            ))}
          </select>
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Hammasi</option>
            <option value="low">⚠️ Kam qolgan (≤{LOW})</option>
            <option value="out">⛔ Tugagan</option>
          </select>
        </div>
      </div>

      {shown.map((p) => (
        <div className="card stock-card" key={p.id}>
          <div className="stock-head">
            {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" /> : <span className="stock-noimg">📷</span>}
            <div>
              <b>{p.nameUz}</b>
              <span className="muted">
                {p.category?.emoji} {p.category?.nameUz}
                {p.brand ? ` · ${p.brand}` : ''}
              </span>
            </div>
          </div>

          {(p.variants || []).length === 0 && (
            <div className="muted" style={{ fontSize: 13 }}>
              Variant yo'q — "Mahsulotlar" bo'limida o'lcham/hajm qo'shing
            </div>
          )}

          {(p.variants || []).map((v) => {
            const n = stockOf(v);
            const color = Number(n) <= 0 ? '#dc2626' : Number(n) <= LOW ? '#d97706' : undefined;
            return (
              <div className={`stock-row ${draft[v.id] !== undefined ? 'changed' : ''}`} key={v.id}>
                <span className="stock-label">{v.label || '—'}</span>
                <div className="stock-ctrl">
                  <button className="btn sm light" onClick={() => bump(v, -1)}>
                    −
                  </button>
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={n}
                    style={color ? { color, fontWeight: 700 } : undefined}
                    onChange={(e) => setStock(v, e.target.value)}
                  />
                  <button className="btn sm light" onClick={() => bump(v, 1)}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {!shown.length && (
        <div className="card muted" style={{ textAlign: 'center' }}>
          Mahsulot topilmadi
        </div>
      )}

      {dirty > 0 && (
        <div className="stock-save">
          <button className="btn light" onClick={() => setDraft({})} disabled={saving}>
            Bekor
          </button>
          <button className="btn gold" onClick={save} disabled={saving}>
            {saving ? 'Saqlanmoqda…' : `💾 Saqlash (${dirty})`}
          </button>
        </div>
      )}
    </div>
  );
}
