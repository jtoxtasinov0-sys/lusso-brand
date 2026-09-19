import { useEffect, useState } from 'react';
import api from '../api';
import ImageUploader from '../components/ImageUploader';

// Storylar va kategoriyalar shu sahifada boshqariladi
export default function ContentPage({ toast }) {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [storyImages, setStoryImages] = useState([]);
  const [storyTitleUz, setStoryTitleUz] = useState('');
  const [storyTitleRu, setStoryTitleRu] = useState('');
  const [storyLink, setStoryLink] = useState('');

  const [cat, setCat] = useState({ slug: '', nameUz: '', nameRu: '', emoji: '' });

  const load = () => {
    api.stories().then(setStories).catch((e) => toast(e.message, true));
    api.categories().then(setCategories).catch(() => {});
  };

  useEffect(load, []);

  const addStory = async () => {
    if (!storyImages[0]) return toast('Avval rasm yuklang', true);
    try {
      await api.createStory({
        imageUrl: storyImages[0],
        titleUz: storyTitleUz,
        titleRu: storyTitleRu || storyTitleUz,
        link: storyLink || null,
      });
      toast("Story qo'shildi ✅");
      setStoryImages([]);
      setStoryTitleUz('');
      setStoryTitleRu('');
      setStoryLink('');
      load();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const delStory = async (id) => {
    if (!confirm("Story o'chirilsinmi?")) return;
    await api.deleteStory(id).catch((e) => toast(e.message, true));
    load();
  };

  const addCategory = async () => {
    if (!cat.slug || !cat.nameUz) return toast("Slug va nom to'ldiring", true);
    try {
      await api.createCategory({ ...cat, nameRu: cat.nameRu || cat.nameUz });
      toast("Kategoriya qo'shildi ✅");
      setCat({ slug: '', nameUz: '', nameRu: '', emoji: '' });
      load();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const delCategory = async (id) => {
    if (!confirm("Kategoriya o'chirilsinmi?")) return;
    try {
      await api.deleteCategory(id);
      load();
    } catch (e) {
      toast(e.message, true);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Story va kategoriyalar</h1>
      </div>

      <div className="grid-2">
        {/* ---------- STORY ---------- */}
        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>📸 Storylar</h3>

          <div className="img-list">
            {stories.map((s) => (
              <div className="img-item" key={s.id}>
                <img src={s.imageUrl} alt="" />
                <button className="del" onClick={() => delStory(s.id)}>
                  ✕
                </button>
                <div className="main-tag">{s.titleUz}</div>
              </div>
            ))}
          </div>

          <ImageUploader
            images={storyImages}
            onChange={setStoryImages}
            onError={(m) => toast(m, true)}
          />

          <div className="grid-2" style={{ marginTop: 12 }}>
            <input
              className="input"
              placeholder="Sarlavha (uz)"
              value={storyTitleUz}
              onChange={(e) => setStoryTitleUz(e.target.value)}
            />
            <input
              className="input"
              placeholder="Заголовок (ru)"
              value={storyTitleRu}
              onChange={(e) => setStoryTitleRu(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label className="label">"Xarid qilish" tugmasi qaysi bo'limni ochsin?</label>
            <select className="input" value={storyLink} onChange={(e) => setStoryLink(e.target.value)}>
              <option value="">Butun katalog</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.emoji} {c.nameUz}
                </option>
              ))}
            </select>
          </div>

          <button className="btn full" style={{ marginTop: 12 }} onClick={addStory}>
            + Story qo'shish
          </button>
        </div>

        {/* ---------- KATEGORIYALAR ---------- */}
        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>🗂 Kategoriyalar</h3>

          {categories.map((c) => (
            <div className="info-row" key={c.id}>
              <span style={{ color: 'var(--text)' }}>
                {c.emoji} {c.nameUz}{' '}
                <span className="muted">({c._count?.products ?? 0} ta mahsulot)</span>
              </span>
              <button className="btn sm danger" onClick={() => delCategory(c.id)}>
                🗑
              </button>
            </div>
          ))}

          <div className="grid-2" style={{ marginTop: 16 }}>
            <input
              className="input"
              placeholder="slug (masalan: watches)"
              value={cat.slug}
              onChange={(e) => setCat({ ...cat, slug: e.target.value })}
            />
            <input
              className="input"
              placeholder="Emoji (⌚)"
              value={cat.emoji}
              onChange={(e) => setCat({ ...cat, emoji: e.target.value })}
            />
          </div>
          <div className="grid-2" style={{ marginTop: 10 }}>
            <input
              className="input"
              placeholder="Nomi (uz)"
              value={cat.nameUz}
              onChange={(e) => setCat({ ...cat, nameUz: e.target.value })}
            />
            <input
              className="input"
              placeholder="Название (ru)"
              value={cat.nameRu}
              onChange={(e) => setCat({ ...cat, nameRu: e.target.value })}
            />
          </div>

          <button className="btn full" style={{ marginTop: 12 }} onClick={addCategory}>
            + Kategoriya qo'shish
          </button>
        </div>
      </div>
    </>
  );
}
