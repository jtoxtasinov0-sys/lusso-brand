// Buyurtmalar bilan ishlash (Prisma logikasi)
import prisma from '../database/connection.js';

function generateOrderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `LS-${ymd}-${rnd}`;
}

export const OrderModel = {
  async create(userId, payload) {
    return prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        items: payload.items,
        subtotal: payload.subtotal,
        deliveryFee: payload.deliveryFee,
        total: payload.total,
        customerName: payload.customerName,
        phone: payload.phone,
        street: payload.street,
        detail: payload.detail || null,
        comment: payload.comment || null,
      },
      include: { user: true },
    });
  },

  async byUser(userId) {
    return prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  async byId(id) {
    return prisma.order.findUnique({ where: { id: Number(id) }, include: { user: true } });
  },

  async listAll({ status } = {}) {
    return prisma.order.findMany({
      where: status && status !== 'all' ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  },

  async attachReceipt(id, receiptUrl) {
    return prisma.order.update({
      where: { id: Number(id) },
      data: { receiptUrl, status: 'RECEIPT_SENT' },
      include: { user: true },
    });
  },

  async updateStatus(id, status, extra = {}) {
    return prisma.order.update({
      where: { id: Number(id) },
      data: { status, ...extra },
      include: { user: true },
    });
  },

  // Admin dashboard uchun statistika
  async stats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [total, today, pending, users, revenueAgg, todayRevenueAgg] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { status: { in: ['PENDING_PAYMENT', 'RECEIPT_SENT'] } } }),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfDay }, status: { not: 'CANCELLED' } },
      }),
    ]);

    // Eng ko'p sotilgan mahsulotlar (items JSON ichidan hisoblanadi)
    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { items: true },
      take: 500,
      orderBy: { createdAt: 'desc' },
    });

    const counter = {};
    for (const o of orders) {
      for (const it of o.items || []) {
        const key = it.name;
        if (!counter[key]) counter[key] = { name: key, qty: 0, sum: 0 };
        counter[key].qty += it.qty;
        counter[key].sum += it.price * it.qty;
      }
    }
    const top = Object.values(counter)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalOrders: total,
      todayOrders: today,
      pendingOrders: pending,
      totalUsers: users,
      revenue: revenueAgg._sum.total || 0,
      todayRevenue: todayRevenueAgg._sum.total || 0,
      topProducts: top,
    };
  },
};

export default OrderModel;
