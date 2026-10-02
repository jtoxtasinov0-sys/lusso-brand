import { useEffect, useMemo, useState } from 'react';
import api from './api';
import { dict } from './i18n';
import { useApp, useCart, useFav, cartLink, importCartFromUrl } from './store';
import { haptic, showBackButton, isTelegram, openLink } from './telegram';
import { hideSplash } from './splash';
import { flyToCart } from './fx';

import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import ProductSheet from './components/ProductSheet';
import StoryViewer from './components/StoryViewer';
import { inStock } from './components/ProductCard';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Saved from './pages/Saved';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

// Telegram ilovasidan savat bilan kelingan bo'lsa — savat sahifasidan boshlaymiz
const cameWithCart = !isTelegram() && importCartFromUrl();

export default function App() {
  const { lang, setLang, user, setUser, settings, setSettings } = useApp();
  const cart = useCart();
  const favCount = useFav((s) => s.ids.length);
  const t = dict[lang] || dict.uz;

  const [onboarded, setOnboarded] = useState(() => {
    try {
      return localStorage.getItem('lusso-onboarded') === '1';
    } catch {
      return true;
    }
  });
  const [tab, setTab] = useState(cameWithCart ? 'cart' : 'home');
  const [screen, setScreen] = useState(null); // checkout | payment | orders
  const [sheet, setSheet] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchFocus, setSearchFocus] = useState(false);

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('');
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
    api.bestsellers().then(setBestsellers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Katalog ----------
  useEffect(() => {
    setLoading(true);
    // Filtr qo'yilmagan bo'lsa — shu javob butun katalog sifatida ham saqlanadi
    // (bosh sahifa, sevimlilar, upsell uchun)
    const isFullList = category === 'all' && !search.trim() && !brand;

    const timer = setTimeout(
      () => {
        api
          .catalog({ category, search, sort, brand })
          .then((res) => {
            setProducts(res.products);
            setCategories(res.categories);
            if (isFullList) setAllProducts(res.products);
          })
          .catch((e) => showToast(e.message))
          .finally(() => {
            setLoading(false);
            hideSplash();
          });
      },
      search ? 350 : 0
    );

    return () => clearTimeout(timer);
  }, [category, search, sort, brand]);

  // ---------- Telegram orqaga tugmasi ----------
  useEffect(() => {
    if (storyIndex !== null) return showBackButton(() => setStoryIndex(null));
    if (screen) return showBackButton(() => setScreen(null));
    if (sheet) return showBackButton(() => setSheet(null));
    if (tab !== 'home') return showBackButton(() => setTab('home'));
    return undefined;
  }, [screen, sheet, tab, storyIndex]);

  // Bo'lim almashganda tepaga
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  function showToast(text) {
    setToast({ text, id: Date.now() });
  }

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const changeLang = (value) => {
    setLang(value);
    api.setLanguage(value).catch(() => {});
  };

  const goCatalog = (slug, focusSearch = false) => {
    setCategory(slug || 'all');
    setBrand('');
    setSearchFocus(focusSearch);
    setTab('catalog');
  };

  // Joriy kategoriyadagi brendlar (filtr chiplari uchun)
  const brands = useMemo(() => {
    const list = allProducts.filter((p) => category === 'all' || p.category?.slug === category);
    return [...new Set(list.map((p) => p.brand).filter(Boolean))].sort();
  }, [allProducts, category]);

  // ---------- Savat ----------
  const addToCart = (item, imgEl) => {
    cart.add(item);
    flyToCart(imgEl);
    showToast(t.addedToCart);
  };

  // Kartadagi "+" — bitta variant bo'lsa darhol qo'shadi, bir nechta bo'lsa oynani ochadi
  const quickAdd = (product, imgEl) => {
    const available = (product.variants || []).filter((v) => v.stock > 0);
    if (available.length > 1) {
      setSheet(product);
      return false;
    }
    const v = available[0];
    if (!v && product.variants?.length) {
      showToast(t.outOfStock);
      haptic('error');
      return false;
    }
    addToCart(
      {
        productId: product.id,
        variantId: v?.id || null,
        name: lang === 'ru' ? product.nameRu : product.nameUz,
        variant: v?.label || null,
        price: product.price + (v?.extraPrice || 0),
        image: product.images?.[0]?.url,
        qty: 1,
      },
      imgEl
    );
    return true;
  };

  // Qo'shimcha taklif: savatda ko'zoynak bo'lsa — atir taklif qilinadi,
  // aks holda katalogdagi eng arzon, savatda yo'q mahsulot
  const upsell = useMemo(() => {
    if (!allProducts.length || !cart.items.length) return null;
    const inCart = new Set(cart.items.map((i) => i.productId));
    const available = allProducts.filter((p) => !inCart.has(p.id) && inStock(p));
    if (!available.length) return null;

    const hasGlasses = cart.items.some((i) => {
      const p = allProducts.find((x) => x.id === i.productId);
      return p?.category?.slug === 'glasses';
    });

    if (hasGlasses) {
      const perfume = available
        .filter((p) => p.category?.slug === 'perfume')
        .sort((a, b) => a.price - b.price)[0];
      if (perfume) return perfume;
    }

    return [...available].sort((a, b) => a.price - b.price)[0] || null;
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
    showToast(t.addedToCart);
  };

  // Telegram ilovasida buyurtma berish o'chiq bo'lsa (serverdagi TELEGRAM_ORDERS),
  // buyurtma sayt orqali beriladi: savat bilan birga brauzerda ochamiz
  const orderInBrowser = isTelegram() && settings?.telegramOrders === false;

  const checkout = () => {
    if (!orderInBrowser) {
      setScreen('checkout');
      return;
    }
    haptic('light');
    openLink(cartLink(cart.items));
  };

  // ---------- Onboarding ----------
  if (!onboarded) {
    return (
      <Onboarding
        t={t}
        onDone={() => {
          try {
            localStorage.setItem('lusso-onboarded', '1');
          } catch {
            /* ignore */
          }
          setOnboarded(true);
        }}
      />
    );
  }

  const catalogSource = allProducts.length ? allProducts : products;

  return (
    <>
      <div key={tab}>
        {tab === 'home' && (
          <Home
            t={t}
            lang={lang}
            user={user}
            stories={stories}
            products={catalogSource}
            categories={categories}
            bestsellers={bestsellers}
            loading={loading}
            onOpen={setSheet}
            onQuickAdd={quickAdd}
            goCatalog={goCatalog}
            onStoryClick={(i) => setStoryIndex(i)}
            onLang={() => changeLang(lang === 'ru' ? 'uz' : 'ru')}
          />
        )}

        {tab === 'catalog' && (
          <Catalog
            t={t}
            lang={lang}
            categories={categories}
            brands={brands}
            products={products}
            loading={loading}
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            onOpen={setSheet}
            onQuickAdd={quickAdd}
            autoFocus={searchFocus}
          />
        )}

        {tab === 'saved' && (
          <Saved
            t={t}
            lang={lang}
            products={catalogSource}
            onOpen={setSheet}
            onQuickAdd={quickAdd}
            goCatalog={() => goCatalog()}
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
            goCatalog={() => goCatalog()}
            orderInBrowser={orderInBrowser}
            onCheckout={checkout}
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
            onSaved={() => setTab('saved')}
          />
        )}
      </div>

      <BottomNav
        tab={tab}
        setTab={(k) => {
          setSearchFocus(false);
          setTab(k);
        }}
        cartCount={cart.count()}
        favCount={favCount}
        t={t}
      />

      {storyIndex !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          startIndex={storyIndex}
          lang={lang}
          t={t}
          onClose={() => setStoryIndex(null)}
          onShop={(story) => {
            setStoryIndex(null);
            const cat = story?.link && categories.find((c) => c.slug === story.link);
            goCatalog(cat ? cat.slug : undefined);
          }}
        />
      )}

      {sheet && (
        <ProductSheet
          product={sheet}
          lang={lang}
          t={t}
          settings={settings}
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

      {screen === 'orders' && <Orders t={t} lang={lang} onBack={() => setScreen(null)} onReorder={reorder} />}

      {toast && (
        <div className="toast" key={toast.id}>
          {toast.text}
        </div>
      )}
    </>
  );
}
