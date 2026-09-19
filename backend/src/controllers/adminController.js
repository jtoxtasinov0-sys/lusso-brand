// Admin Panel API (CRUD, statistika, rassilka)
import config from '../config/default.js';
import prisma from '../database/connection.js';
import { signAdminToken } from '../middlewares/auth.middleware.js';
import { registerFailedLogin, clearFailedLogins } from '../middlewares/ratelimit.middleware.js';
import ProductModel from '../models/Product.js';
import OrderModel from '../models/Order.js';
import UserModel from '../models/User.js';
import SettingModel from '../models/Setting.js';
import { notifyStatus, runBroadcast } from './botController.js';

// ---------------- KIRISH ----------------
export function login(req, res) {
  const { password } = req.body;

  if (password !== config.adminPassword) {
    const left = registerFailedLogin(req.loginIp);
    return res.status(401).json({
      error:
        left > 0 ? `Parol noto'g'ri. Yana ${left} ta urinish qoldi.` : "Parol noto'g'ri",
    });
  }

  clearFailedLogins(req.loginIp);
  res.json({ token: signAdminToken() });
}

// ---------------- DASHBOARD ----------------
export async function stats(req, res) {
  const [data, lowStock] = await Promise.all([OrderModel.stats(), ProductModel.lowStock(3)]);
  res.json({
    ...data,
    lowStock: lowStock.map((v) => ({
      product: v.product.nameUz,
      label: v.label,
      stock: v.stock,
    })),
  });
}

// ---------------- BUYURTMALAR ----------------
export async function listOrders(req, res) {
  res.json(await OrderModel.listAll({ status: req.query.status }));
}

export async function getOrder(req, res) {
  const order = await OrderModel.byId(req.params.id);
  if (!order) return res.status(404).json({ error: 'Topilmadi' });
  res.json(order);
}

export async function updateOrder(req, res) {
  const { status, trackingNumber, adminNote } = req.body;
  const extra = {};
  if (trackingNumber !== undefined) extra.trackingNumber = trackingNumber || null;
  if (adminNote !== undefined) extra.adminNote = adminNote || null;

  const current = await OrderModel.byId(req.params.id);
  if (!current) return res.status(404).json({ error: 'Topilmadi' });

  const order = await OrderModel.updateStatus(req.params.id, status || current.status, extra);

  // Status o'zgarsa — mijozga bot orqali xabar
  if (status && status !== current.status) notifyStatus(order).catch(() => {});

  res.json(order);
}

// ---------------- MAHSULOTLAR ----------------
export async function listProducts(req, res) {
  res.json(await ProductModel.listAll());
}

export async function createProduct(req, res) {
  try {
    res.json(await ProductModel.create(req.body));
  } catch (err) {
    console.error('createProduct:', err);
    res.status(400).json({ error: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    res.json(await ProductModel.update(req.params.id, req.body));
  } catch (err) {
    console.error('updateProduct:', err);
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProduct(req, res) {
  await ProductModel.remove(req.params.id);
  res.json({ ok: true });
}

// ---------------- KATEGORIYALAR ----------------
export async function listCategories(req, res) {
  res.json(
    await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    })
  );
}

export async function createCategory(req, res) {
  try {
    res.json(await SettingModel.createCategory(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateCategory(req, res) {
  res.json(await SettingModel.updateCategory(req.params.id, req.body));
}

export async function deleteCategory(req, res) {
  try {
    await SettingModel.deleteCategory(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: 'Bu kategoriyada mahsulotlar bor — avval ularni o\'chiring' });
  }
}

// ---------------- STORY ----------------
export async function listStories(req, res) {
  res.json(await SettingModel.stories(false));
}

export async function createStory(req, res) {
  res.json(await SettingModel.createStory(req.body));
}

export async function deleteStory(req, res) {
  await SettingModel.deleteStory(req.params.id);
  res.json({ ok: true });
}

// ---------------- MIJOZLAR ----------------
export async function listUsers(req, res) {
  res.json(await UserModel.list({ search: req.query.search || '' }));
}

// ---------------- RASSILKA ----------------
export async function broadcast(req, res) {
  const { text, imageUrl, buttonText, buttonUrl } = req.body;
  if (!text) return res.status(400).json({ error: 'Matn kiritilmagan' });

  const result = await runBroadcast({ text, imageUrl, buttonText, buttonUrl });

  await prisma.broadcast.create({
    data: {
      text,
      imageUrl: imageUrl || null,
      buttonText: buttonText || null,
      buttonUrl: buttonUrl || null,
      sentCount: result.sent,
      failCount: result.failed,
    },
  });

  res.json(result);
}

export async function broadcastHistory(req, res) {
  res.json(await prisma.broadcast.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }));
}

// ---------------- SOZLAMALAR ----------------
export async function getSettings(req, res) {
  res.json(await SettingModel.get());
}

export async function updateSettings(req, res) {
  res.json(await SettingModel.update(req.body));
}

// ---------------- RASM YUKLASH ----------------
export function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });
  res.json({ url: `/uploads/${req.file.filename}` });
}
