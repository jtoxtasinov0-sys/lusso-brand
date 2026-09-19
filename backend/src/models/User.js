// Mijozlar bilan ishlash (Prisma logikasi)
import prisma from '../database/connection.js';

export const UserModel = {
  async findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  },

  // Telegramdan kelgan mijozni topadi yoki yangisini yaratadi.
  // upsert ishlatilgan — bir vaqtda kelgan so'rovlarda dublikat bo'lmaydi.
  async findOrCreate(tg) {
    const telegramId = String(tg.id);
    const firstName = tg.firstName || 'Mijoz';
    const username = tg.username || null;

    const existing = await prisma.user.findUnique({ where: { telegramId } });
    if (existing) {
      if (existing.firstName === firstName && existing.username === username) return existing;
      return prisma.user.update({ where: { telegramId }, data: { firstName, username } });
    }

    return prisma.user.upsert({
      where: { telegramId },
      update: { firstName, username },
      create: {
        telegramId,
        firstName,
        lastName: tg.lastName || null,
        username,
        language: tg.language || 'uz',
      },
    });
  },

  async setPhone(telegramId, phone) {
    return prisma.user.update({ where: { telegramId: String(telegramId) }, data: { phone } });
  },

  async setLanguage(telegramId, language) {
    return prisma.user.update({ where: { telegramId: String(telegramId) }, data: { language } });
  },

  async list({ search = '' } = {}) {
    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { username: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  },

  async makeAdmin(telegramId) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { isAdmin: true },
    });
  },

  async admins() {
    return prisma.user.findMany({ where: { isAdmin: true }, select: { telegramId: true } });
  },

  async allTelegramIds() {
    const users = await prisma.user.findMany({
      where: { isBlocked: false },
      select: { telegramId: true, language: true },
    });
    return users;
  },

  async count() {
    return prisma.user.count();
  },

  // ---------------- MANZILLAR ----------------
  async addresses(userId) {
    return prisma.address.findMany({ where: { userId }, orderBy: { id: 'desc' } });
  },

  async saveAddress(userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  },

  async deleteAddress(userId, id) {
    return prisma.address.deleteMany({ where: { id: Number(id), userId } });
  },
};

export default UserModel;
