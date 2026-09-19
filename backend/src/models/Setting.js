// Do'kon sozlamalari (yetkazish narxi, bank rekvizitlari va h.k.)
import prisma from '../database/connection.js';

export const SettingModel = {
  async get() {
    let s = await prisma.setting.findUnique({ where: { id: 1 } });
    if (!s) s = await prisma.setting.create({ data: { id: 1 } });
    return s;
  },

  async update(data) {
    const allowed = [
      'shopName',
      'deliveryFee',
      'freeDeliveryFrom',
      'bankName',
      'bankAccount',
      'bankHolder',
      'supportUsername',
      'webAppUrl',
      'aboutUz',
      'aboutRu',
      'isOpen',
    ];
    const clean = {};
    for (const key of allowed) {
      if (data[key] === undefined) continue;
      if (key === 'deliveryFee' || key === 'freeDeliveryFrom') clean[key] = Number(data[key]) || 0;
      else if (key === 'isOpen') clean[key] = Boolean(data[key]);
      else clean[key] = String(data[key]);
    }
    await this.get();
    return prisma.setting.update({ where: { id: 1 }, data: clean });
  },

  // ---------------- STORY ----------------
  async stories(activeOnly = true) {
    return prisma.story.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async createStory(data) {
    return prisma.story.create({ data });
  },

  async deleteStory(id) {
    return prisma.story.delete({ where: { id: Number(id) } });
  },

  // ---------------- KATEGORIYA ----------------
  async createCategory(data) {
    return prisma.category.create({ data });
  },

  async updateCategory(id, data) {
    return prisma.category.update({ where: { id: Number(id) }, data });
  },

  async deleteCategory(id) {
    return prisma.category.delete({ where: { id: Number(id) } });
  },
};

export default SettingModel;
