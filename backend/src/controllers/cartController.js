// Mijoz API: katalog, savat, buyurtma, profil
import config from '../config/default.js';
import prisma from '../database/connection.js';
import UserModel from '../models/User.js';
import ProductModel from '../models/Product.js';
import OrderModel from '../models/Order.js';
import SettingModel from '../models/Setting.js';
import { notifyOrderCreated, notifyReceipt, notifyAdmins } from './botController.js';

// Mini App ochilganda mijozni ro'yxatdan o'tkazish
export async function auth(req, res) {
  const user = await UserModel.findOrCreate(req.tgUser);
  if (req.body?.language && req.body.language !== user.language) {
    await UserModel.setLanguage(user.telegramId, req.body.language);
    user.language = req.body.language;
  }
  const settings = await SettingModel.publicView();
  res.json({ user, settings });
}

export async function getCatalog(req, res) {
  const { category, search, sort, brand } = req.query;
  const [products, categories, brands] = await Promise.all([
    ProductModel.catalog({ categorySlug: category, search, sort, brand }),
    ProductModel.categories(),
    ProductModel.brands(),
  ]);
  res.json({ products, categories, brands });
}

export async function getProduct(req, res) {
  const product = await ProductModel.byId(req.params.id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });
  res.json(product);
}

export async function getStories(req, res) {
  res.json(await SettingModel.stories(true));
}

export async function getSettings(req, res) {
  res.json(await SettingModel.publicView());
}

// ---------------- BUYURTMA ----------------
export async function createOrder(req, res) {
  try {
    const { items = [], customerName, phone, street, detail, comment, saveAddress } = req.body;

    if (!items.length) return res.status(400).json({ error: "Savat bo'sh" });
    if (!customerName || !phone || !street) {
      return res.status(400).json({ error: "Ism, telefon va manzilni to'ldiring" });
    }

    const user = await UserModel.findOrCreate(req.tgUser);
    const settings = await SettingModel.get();
    if (!settings.isOpen) return res.status(400).json({ error: "Do'kon vaqtincha yopiq" });

    // Narxlar serverda qayta hisoblanadi (mijoz yuborgan narxga ishonilmaydi)
    const built = [];
    let subtotal = 0;

    for (const raw of items) {
      const product = await ProductModel.byId(raw.productId);
      if (!product || !product.isActive) continue;

      const variant = raw.variantId
        ? product.variants.find((v) => v.id === Number(raw.variantId))
        : null;

      const qty = Math.max(1, Number(raw.qty) || 1);
      const price = product.price + (variant?.extraPrice || 0);

      if (variant && variant.stock < qty) {
        return res.status(400).json({
          error: `"${product.nameUz} (${variant.label})" — omborda faqat ${variant.stock} ta qoldi`,
        });
      }

      built.push({
        productId: product.id,
        variantId: variant?.id || null,
        name: product.nameUz,
        nameRu: product.nameRu,
        brand: product.brand,
        variant: variant?.label || null,
        price,
        qty,
        image: product.images[0]?.url || null,
      });
      subtotal += price * qty;
    }

    if (!built.length) return res.status(400).json({ error: 'Mahsulotlar topilmadi' });

    const deliveryFee = subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;
    const total = subtotal + deliveryFee;

    const order = await OrderModel.create(user.id, {
      items: built,
      subtotal,
      deliveryFee,
      total,
      customerName,
      phone,
      street,
      detail,
      comment,
    });

    // Zaxirani kamaytirish
    for (const item of built) await ProductModel.decreaseStock(item.variantId, item.qty);

    // Telefon saqlanmagan bo'lsa — saqlab qo'yamiz
    if (!user.phone) await UserModel.setPhone(user.telegramId, phone);

    // Manzilni saqlash
    if (saveAddress) {
      await UserModel.saveAddress(user.id, {
        title: 'Uy',
        street,
        detail: detail || null,
        isDefault: true,
      });
    }

    // Botdan xabarlar
    notifyOrderCreated(order).catch(() => {});
    notifyAdmins(order).catch(() => {});

    res.json({ order, bank: { name: settings.bankName, account: settings.bankAccount, holder: settings.bankHolder } });
  } catch (err) {
    console.error('createOrder:', err);
    res.status(500).json({ error: 'Buyurtmani saqlashda xatolik' });
  }
}

// To'lov cheki (skrinshot) yuklash
export async function uploadReceipt(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Rasm yuklanmadi' });

  const user = await UserModel.findOrCreate(req.tgUser);
  const order = await prisma.order.findFirst({
    where: { id: Number(req.params.id), userId: user.id },
  });
  if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

  const url = `/uploads/${req.file.filename}`;
  const updated = await OrderModel.attachReceipt(order.id, url);

  notifyReceipt(updated).catch(() => {});
  res.json({ ok: true, receiptUrl: url, order: updated });
}

export async function myOrders(req, res) {
  const user = await UserModel.findOrCreate(req.tgUser);
  res.json(await OrderModel.byUser(user.id));
}

export async function myAddresses(req, res) {
  const user = await UserModel.findOrCreate(req.tgUser);
  res.json(await UserModel.addresses(user.id));
}

export async function addAddress(req, res) {
  const user = await UserModel.findOrCreate(req.tgUser);
  const { title, street, detail } = req.body;
  if (!street) return res.status(400).json({ error: "Manzilni kiriting" });
  const saved = await UserModel.saveAddress(user.id, {
    title: title || 'Uy',
    street,
    detail: detail || null,
    isDefault: true,
  });
  res.json(saved);
}

export async function deleteAddress(req, res) {
  const user = await UserModel.findOrCreate(req.tgUser);
  await UserModel.deleteAddress(user.id, req.params.id);
  res.json({ ok: true });
}

export async function setLanguage(req, res) {
  const user = await UserModel.findOrCreate(req.tgUser);
  const lang = req.body.language === 'ru' ? 'ru' : 'uz';
  const updated = await UserModel.setLanguage(user.telegramId, lang);
  res.json(updated);
}

export const clientConfig = { currency: config.shop.currency };
