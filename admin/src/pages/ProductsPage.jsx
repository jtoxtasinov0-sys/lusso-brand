import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';

const money = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

const EMPTY = {
  nameUz: '',
  nameRu: '',
  brand: '',
  categoryId: '',
  price: '',
  oldPrice: '',
  descUz: '',
  descRu: '',
  isActive: true,
  isNew: false,
  images: [],
  variants: [{ label: '', stock: 10, extraPrice: 0 }],
};

const SHOE_PRESET = ['240', '245', '250', '255', '260', '265', '270', '275', '280', '285'];
const ML_PRESET = ['30ml', '50ml', '100ml'];

export default function ProductsPage({ toast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    Promise.all([api.products(), api.categories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((e) => toast(e.message, true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditId(null);
    setForm({ ...EMPTY, categoryId: categories[0]?.id || '' });
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      nameUz: p.nameUz,
      nameRu: p.nameRu,
      brand: p.brand || '',
      categoryId: p.categoryId,
      price: p.price,
      oldPrice: p.oldPrice || '',
      descUz: p.descUz || '',
      descRu: p.descRu || '',
      isActive: p.isActive,
      isNew: p.isNew,
      images: p.images.map((i) => i.url),
      variants: p.variants.length
        ? p.variants.map((v) => ({ label: v.label, stock: v.stock, extraPrice: v.extraPrice }))
        : [{ label: '', stock: 10, extraPrice: 0 }],
    });
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setVariant = (i, k, v) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [k]: v };
      return { ...f, variants };
    });

  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { label: '', stock: 10, extraPrice: 0 }] }));

  const removeVariant = (i) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const applyPreset = (list) =>
    setForm((f) => ({
      ...f,
      variants: list.map((label) => ({ label, stock: 10, extraPrice: 0 })),
    }));

  const save = async () => {
    if (!form.nameUz || !form.price || !form.categoryId) {
      toast("Nom, narx va kategoriya to'ldirilishi shart", true);
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      nameRu: form.nameRu || form.nameUz,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      categoryId: Number(form.categoryId),
      variants: form.variants.filter((v) => String(v.label).trim()),
    };
    try {
      if (editId) await api.updateProduct(editId, payload);
      else await api.createProduct(payload);
      toast(editId ? 'Yangilandi ✅' : "Qo'shildi ✅");
      setForm(null);
      load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`"${p.nameUz}" o'chirilsinmi?`)) return;
    try {
      await api.deleteProduct(p.id);
      toast("O'chirildi");
      load();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const shown = filter === 'all' ? products : products.filter((p) => p.category?.slug === filter);

  return (
    <>
      <div className="page-head">
        <h1>Mahsulotlar</h1>
        <button className="btn" onClick={openNew}>
          + Yangi mahsulot
        </button>
      </div>

      <div className="filters">
        <button className={`filter ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
          Hammasi ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`filter ${filter === c.slug ? 'on' : ''}`}
            onClick={() => setFilter(c.slug)}
          >
            {c.emoji} {c.nameUz} ({products.filter((p) => p.categoryId === c.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rasm</th>
                <th>Nomi</th>
                <th>Kategoriya</th>
                <th>Narx</th>
                <th>Zaxira</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id}>
                    <td>
                      <img className="thumb" src={p.images[0]?.url} alt="" />
                    </td>
                    <td>
                      <b>{p.nameUz}</b>
                      <div className="muted">{p.brand}</div>
                    </td>
                    <td className="muted nowrap">
                      {p.category?.emoji} {p.category?.nameUz}
                    </td>
                    <td className="nowrap">
                      <b>{money(p.price)}</b>
                      {p.oldPrice ? (
                        <div className="muted" style={{ textDecoration: 'line-through' }}>
                          {money(p.oldPrice)}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className="pill" style={stock === 0 ? { color: '#dc2626' } : {}}>
                        {stock} ta
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${p.isActive ? 'DELIVERED' : 'CANCELLED'}`}>
                        {p.isActive ? 'Faol' : 'Yopiq'}
                      </span>
                    </td>
                    <td className="nowrap">
                      <button className="btn sm light" onClick={() => openEdit(p)}>
                        ✏️
                      </button>{' '}
                      <button className="btn sm danger" onClick={() => remove(p)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <Modal
          title={editId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
          onClose={() => setForm(null)}
          wide
        >
          <div className="form-row">
            <label className="label">Rasmlar (birinchisi asosiy bo'ladi)</label>
            <ImageUploader
              images={form.images}
              onChange={(images) => set('images', images)}
              onError={(m) => toast(m, true)}
            />
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label">Nomi (o'zbekcha) *</label>
              <input className="input" value={form.nameUz} onChange={(e) => set('nameUz', e.target.value)} />
            </div>
            <div className="form-row">
              <label className="label">Nomi (ruscha)</label>
              <input className="input" value={form.nameRu} onChange={(e) => set('nameRu', e.target.value)} />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-row">
              <label className="label">Brend</label>
              <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </div>
            <div className="form-row">
              <label className="label">Kategoriya *</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.nameUz}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="label">Yangi narx (₩) *</label>
              <input
                className="input"
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-row">
              <label className="label">Eski narx (chizilib ko'rsatiladi)</label>
              <input
                className="input"
                type="number"
                value={form.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="label">Faol</label>
              <select
                className="input"
                value={form.isActive ? '1' : '0'}
                onChange={(e) => set('isActive', e.target.value === '1')}
              >
                <option value="1">Ha — do'konda ko'rinadi</option>
                <option value="0">Yo'q — yashirilgan</option>
              </select>
            </div>
            <div className="form-row">
              <label className="label">NEW belgisi</label>
              <select
                className="input"
                value={form.isNew ? '1' : '0'}
                onChange={(e) => set('isNew', e.target.value === '1')}
              >
                <option value="0">Yo'q</option>
                <option value="1">Ha — "Yangi kelganlar"da</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label">Tarkibi / tavsifi (o'zbekcha — har qator alohida band)</label>
              <textarea
                className="input"
                value={form.descUz}
                onChange={(e) => set('descUz', e.target.value)}
                placeholder={'Tabiiy charm\nUV400 himoya\nOriginal quti bilan'}
              />
            </div>
            <div className="form-row">
              <label className="label">Tavsif (ruscha)</label>
              <textarea
                className="input"
                value={form.descRu}
                onChange={(e) => set('descRu', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <label className="label">
              O'lcham / variantlar va zaxira
              <button className="btn sm light" style={{ marginLeft: 8 }} onClick={() => applyPreset(SHOE_PRESET)}>
                👟 Oyoq kiyim o'lchamlari
              </button>{' '}
              <button className="btn sm light" onClick={() => applyPreset(ML_PRESET)}>
                🧴 30/50/100ml
              </button>
            </label>

            <div className="var-head">
              <div>Nomi (265 / 100ml / Qora)</div>
              <div>Zaxira</div>
              <div>Qo'shimcha narx</div>
              <div />
            </div>

            {form.variants.map((v, i) => (
              <div className="variant-row" key={i}>
                <input
                  className="input"
                  value={v.label}
                  placeholder="265"
                  onChange={(e) => setVariant(i, 'label', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  value={v.stock}
                  onChange={(e) => setVariant(i, 'stock', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  value={v.extraPrice}
                  onChange={(e) => setVariant(i, 'extraPrice', e.target.value)}
                />
                <button className="rm" onClick={() => removeVariant(i)}>
                  ✕
                </button>
              </div>
            ))}

            <button className="btn sm light" onClick={addVariant}>
              + Variant qo'shish
            </button>
          </div>

          <button className="btn full" style={{ marginTop: 14 }} onClick={save} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </Modal>
      )}
    </>
  );
}
