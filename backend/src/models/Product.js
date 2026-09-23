// Mahsulotlar bilan ishlash (Prisma logikasi)
import prisma from '../database/connection.js';

const withRelations = {
  images: { orderBy: { sortOrder: 'asc' } },
  variants: { orderBy: { sortOrder: 'asc' } },
  category: true,
};

export const ProductModel = {
  // Mini App katalogi
  async catalog({ categorySlug, search, sort, brand } = {}) {
    const where = { isActive: true };

    if (categorySlug && categorySlug !== 'all') where.category = { slug: categorySlug };
    if (brand && brand !== 'all') where.brand = brand;
    if (search) {
      where.OR = [
        { nameUz: { contains: search, mode: 'insensitive' } },
        { nameRu: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy = [{ sortOrder: 'asc' }, { id: 'desc' }];
    if (sort === 'price_asc') orderBy = [{ price: 'asc' }];
    if (sort === 'price_desc') orderBy = [{ price: 'desc' }];
    if (sort === 'new') orderBy = [{ createdAt: 'desc' }];

    return prisma.product.findMany({ where, include: withRelations, orderBy });
  },

  async byId(id) {
    return prisma.product.findUnique({ where: { id: Number(id) }, include: withRelations });
  },

  async brands() {
    const rows = await prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return rows.map((r) => r.brand).filter(Boolean);
  },

  async categories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  // Eng ko'p sotilgan mahsulotlar (buyurtmalar items JSON'idan hisoblanadi)
  async bestsellers(limit = 10) {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { items: true },
      take: 1000,
      orderBy: { createdAt: 'desc' },
    });

    const soldQty = {};
    for (const o of orders) {
      for (const it of o.items || []) {
        if (!it.productId) continue;
        soldQty[it.productId] = (soldQty[it.productId] || 0) + (it.qty || 0);
      }
    }

    const topIds = Object.entries(soldQty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => Number(id));

    if (!topIds.length) return [];

    const products = await prisma.product.findMany({
      where: { id: { in: topIds }, isActive: true },
      include: withRelations,
    });

    const rank = new Map(topIds.map((id, i) => [id, i]));
    return products.sort((a, b) => rank.get(a.id) - rank.get(b.id));
  },

  // ---------------- ADMIN ----------------
  async listAll() {
    return prisma.product.findMany({
      include: withRelations,
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
    });
  },

  async create(data) {
    const { images = [], variants = [], ...rest } = data;
    return prisma.product.create({
      data: {
        ...rest,
        categoryId: Number(rest.categoryId),
        price: Number(rest.price),
        oldPrice: rest.oldPrice ? Number(rest.oldPrice) : null,
        images: { create: images.map((url, i) => ({ url, sortOrder: i })) },
        variants: {
          create: variants.map((v, i) => ({
            label: String(v.label),
            stock: Number(v.stock) || 0,
            extraPrice: Number(v.extraPrice) || 0,
            sortOrder: i,
          })),
        },
      },
      include: withRelations,
    });
  },

  async update(id, data) {
    const { images, variants, ...rest } = data;
    const productId = Number(id);

    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({ productId, url, sortOrder: i })),
      });
    }

    if (Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId } });
      await prisma.productVariant.createMany({
        data: variants.map((v, i) => ({
          productId,
          label: String(v.label),
          stock: Number(v.stock) || 0,
          extraPrice: Number(v.extraPrice) || 0,
          sortOrder: i,
        })),
      });
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...rest,
        ...(rest.categoryId !== undefined ? { categoryId: Number(rest.categoryId) } : {}),
        ...(rest.price !== undefined ? { price: Number(rest.price) } : {}),
        ...(rest.oldPrice !== undefined ? { oldPrice: rest.oldPrice ? Number(rest.oldPrice) : null } : {}),
      },
      include: withRelations,
    });
  },

  async remove(id) {
    return prisma.product.delete({ where: { id: Number(id) } });
  },

  // Zaxirani kamaytirish (buyurtma berilganda)
  async decreaseStock(variantId, qty) {
    if (!variantId) return;
    await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { stock: { decrement: Number(qty) } },
    });
  },

  async checkStock(items) {
    const problems = [];
    for (const item of items) {
      if (!item.variantId) continue;
      const v = await prisma.productVariant.findUnique({ where: { id: Number(item.variantId) } });
      if (!v || v.stock < item.qty) {
        problems.push({ name: item.name, label: item.variant, available: v ? v.stock : 0 });
      }
    }
    return problems;
  },

  async lowStock(limit = 3) {
    return prisma.productVariant.findMany({
      where: { stock: { lte: limit } },
      include: { product: { select: { nameUz: true } } },
      orderBy: { stock: 'asc' },
      take: 20,
    });
  },
};

export default ProductModel;
