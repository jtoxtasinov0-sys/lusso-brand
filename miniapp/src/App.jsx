import { useEffect, useMemo, useState } from 'react';
import api from './api';
import { dict } from './i18n';
import { useApp, useCart } from './store';
import { haptic, showBackButton } from './telegram';

import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import ProductSheet from './components/ProductSheet';
import StoryViewer from './components/StoryViewer';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

export default function App() {
  const { lang, setLang, user, setUser, settings, setSettings } = useApp();
  const cart = useCart();
  const t = dict[lang] || dict.uz;

  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('lusso-onboarded') === '1'
  );
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState(null); // checkout | payment | orders
  const [sheet, setSheet] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null);
  const [toast, setToast] = useState('');

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  const [orderResult, setOrderResult] = useState(null);
  const [upsellOn, setUpsellOn] = useState(false);

  // ---------- Boshlang'ich yuklash ----------
  useEffect(() => {
    api
      .auth(lang)
      .then((res) => {
        setUser(res.user);
        setSettings(res.settings);
        if (res.user?.language && res.user.language !== lang) setLang(res.user.language);
      })
      .catch((e) => showToast(e.message));

    api.stories().then(setStories).catch(() => {});
    // Qo'shimcha taklif (upsell) uchun butun katalog
    api.catalog().then((res) => setAllProducts(res.products)).catch(() => {});
  }, []);

  // ---------- Katalog ----------
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .catalog({ category, search, sort })
        .then((res) => {
          setProducts(res.products);
          setCategories(res.categories);
        })
        .catch((e) => showToast(e.message))
        .finally(() => setLoading(false));
    }, search ? 350 : 0);

    return () => clearTimeout(timer);
  }, [category, search, sort]);

  // ---------- Telegram orqaga tugmasi ----------
  useEffect(() => {
    if (storyIndex !== null) return showBackButton(() => setStoryIndex(null));
    if (screen) return showBackButton(() => setScreen(null));
    if (sheet) return showBackButton(() => setSheet(null));
    if (tab !== 'home') return showBackButton(() => setTab('home'));
    return undefined;
  }, [screen, sheet, tab, storyIndex]);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(''), 2200);
  }

  const changeLang = (value) => {
    setLang(value);
    api.setLanguage(value).catch(() => {});
  };

  // ---------- Savat ----------
  const addToCart = (item) => {
    cart.add(item);
    showToast(lang === 'ru' ? 'Добавлено в корзину ✅' : "Savatga qo'shildi ✅");
  };

  const quickAdd = (product) => {
    const available = (product.variants || []).filter((v) => v.stock > 0);
    if (available.length > 1) {
      setSheet(product);
      return;
    }
    const v = available[0];
    if (!v && product.variants?.length) {
      showToast(t.outOfStock);
      haptic('error');
      return;
    }
    addToCart({
      productId: product.id,
      variantId: v?.id || null,
      name: lang === 'ru' ? product.nameRu : product.nameUz,
      variant: v?.label || null,
      price: product.price + (v?.extraPrice || 0),
      image: product.images?.[0]?.url,
      qty: 1,
    });
  };

  // Qo'shimcha taklif: katalogdagi eng arzon, savatda yo'q mahsulot
  const upsell = useMemo(() => {
    if (!allProducts.length || !cart.items.length) return null;
    const inCart = new Set(cart.items.map((i) => i.productId));
    return (
      allProducts
        .filter((p) => !inCart.has(p.id) && (p.variants || []).some((v) => v.stock > 0))
        .sort((a, b) => a.price - b.price)[0] || null
    );
  }, [allProducts, cart.items]);

  const toggleUpsell = () => {
    if (!upsell) return;
    const v = (upsell.variants || []).find((x) => x.stock > 0);
    const key = `${upsell.id}-${v?.id || 0}`;
    if (upsellOn) {
      cart.remove(key);
      setUpsellOn(false);
    } else {
      cart.add({
        productId: upsell.id,
        variantId: v?.id || null,
        name: lang === 'ru' ? upsell.nameRu : upsell.nameUz,
        variant: v?.label || null,
        price: upsell.price + (v?.extraPrice || 0),
        image: upsell.images?.[0]?.url,
        qty: 1,
      });
      setUpsellOn(true);
    }
  };

  const reorder = (order) => {
    (order.items || []).forEach((i) =>
      cart.add({
        productId: i.productId,
        variantId: i.variantId,
        name: lang === 'ru' && i.nameRu ? i.nameRu : i.name,
        variant: i.variant,
        price: i.price,
        image: i.image,
        qty: i.qty,
      })
    );
    setScreen(null);
    setTab('cart');
    showToast(lang === 'ru' ? 'Добавлено в корзину ✅' : "Savatga qo'shildi ✅");
  };

  // ---------- Onboarding ----------
  if (!onboarded) {
    return (
      <Onboarding
        t={t}
        onDone={() => {
          localStorage.setItem('lusso-onboarded', '1');
          setOnboarded(true);
        }}
      />
    );
  }

  return (
    <>
      {tab === 'home' && (
        <Home
          t={t}
          lang={lang}
          user={user}
          stories={stories}
          products={products}
          loading={loading}
          onOpen={setSheet}
          onQuickAdd={quickAdd}
          goCatalog={() => setTab('catalog')}
          onStoryClick={(i) => setStoryIndex(i)}
        />
      )}

      {tab === 'catalog' && (
        <Catalog
          t={t}
          lang={lang}
          categories={categories}
          products={products}
          loading={loading}
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          onOpen={setSheet}
          onQuickAdd={quickAdd}
        />
      )}

      {tab === 'cart' && (
        <Cart
          t={t}
          lang={lang}
          items={cart.items}
          inc={cart.inc}
          dec={cart.dec}
          remove={cart.remove}
          settings={settings}
          upsell={upsell}
          upsellOn={upsellOn}
          onToggleUpsell={toggleUpsell}
          goCatalog={() => setTab('catalog')}
          onCheckout={() => setScreen('checkout')}
        />
      )}

      {tab === 'profile' && (
        <Profile
          t={t}
          lang={lang}
          setLang={changeLang}
          user={user}
          settings={settings}
          onOrders={() => setScreen('orders')}
        />
      )}

      <BottomNav tab={tab} setTab={setTab} cartCount={cart.count()} t={t} />

      {storyIndex !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          startIndex={storyIndex}
          lang={lang}
          t={t}
          onClose={() => setStoryIndex(null)}
          onShop={(story) => {
            setStoryIndex(null);
            if (story?.link) {
              const cat = categories.find((c) => c.slug === story.link);
              if (cat) setCategory(cat.slug);
            }
            setTab('catalog');
          }}
        />
      )}

      {sheet && (
        <ProductSheet
          product={sheet}
          lang={lang}
          t={t}
          onClose={() => setSheet(null)}
          onAdd={addToCart}
        />
      )}

      {screen === 'checkout' && (
        <Checkout
          t={t}
          user={user}
          items={cart.items}
          settings={settings}
          onBack={() => setScreen(null)}
          onCreated={(res) => {
            setOrderResult(res);
            cart.clear();
            setUpsellOn(false);
            setScreen('payment');
          }}
        />
      )}

      {screen === 'payment' && orderResult && (
        <Payment
          t={t}
          order={orderResult.order}
          bank={orderResult.bank}
          onDone={() => {
            setScreen(null);
            setTab('home');
          }}
        />
      )}

      {screen === 'orders' && (
        <Orders t={t} lang={lang} onBack={() => setScreen(null)} onReorder={reorder} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
