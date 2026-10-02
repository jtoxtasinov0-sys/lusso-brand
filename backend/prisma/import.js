/**
 * MAHSULOTLARNI PAPKADAN YUKLASH
 *
 *   6-MAHSULOT-YUKLASH.bat  yoki  npm run db:import
 *
 * Rasmlar MAHSULOTLAR/<kategoriya>/ papkasiga tashlanadi, fayl nomi —
 * "Mahsulot nomi - narx". Batafsil: MAHSULOTLAR/QOLLANMA.txt
 *
 * Skript: rasmlarni kichraytiradi → backend/uploads/mahsulot/ ga qo'yadi →
 * GitHub'ga yuboradi (Render ularni ko'rsatishi uchun) → bazaga yozadi →
 * yuklangan rasmlarni MAHSULOTLAR/_yuklangan/ ga olib qo'yadi.
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import prisma from '../src/database/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const INBOX = path.join(ROOT, 'MAHSULOTLAR');
const DONE = path.join(INBOX, '_yuklangan');
const OUT = path.resolve(__dirname, '../uploads/mahsulot');
const RESIZE = path.join(__dirname, 'resize.ps1');
// Ixtiyoriy: mahsulot nomi → { brand, descUz, descRu, variants } (MAHSULOTLAR/tavsiflar.json)
const EXTRA_FILE = path.join(INBOX, 'tavsiflar.json');

const AUTO_YES = process.argv.includes('--ha');
const IMAGE_EXT = /\.(jpe?g|png|webp|bmp|gif)$/i;

const SHOE_SIZES = ['240', '245', '250', '255', '260', '265', '270', '275', '280', '285'];
const SHOE_STOCK = 3;
const OTHER_STOCK = 10;

// Ikki so'zli brendlar — qolganlarida brend = birinchi so'z
const BRANDS = [
  ['air jordan', 'Jordan'], ['air force', 'Nike'], ['air max', 'Nike'],
  ['new balance', 'New Balance'], ['tom ford', 'Tom Ford'], ['emporio armani', 'Emporio Armani'],
  ['giorgio armani', 'Giorgio Armani'], ['yves saint laurent', 'Yves Saint Laurent'],
  ['saint laurent', 'Saint Laurent'], ['louis vuitton', 'Louis Vuitton'], ['dolce', 'Dolce & Gabbana'],
  ['maison margiela', 'Maison Margiela'], ['maison francis', 'Maison Francis Kurkdjian'],
  ['paco rabanne', 'Paco Rabanne'], ['jean paul', 'Jean Paul Gaultier'], ['hugo boss', 'Hugo Boss'],
  ['ray ban', 'Ray-Ban'], ['rayban', 'Ray-Ban'], ['ysl', 'Yves Saint Laurent'], ['lv', 'Louis Vuitton'],
];

const money = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

function categoryOf(folder) {
  const f = folder.toLowerCase().replace(/['`ʻʼ‘’]/g, '');
  if (/oyoq|shoe|krossov|tufli|poyabzal|обув|кросс/.test(f)) return 'shoes';
  if (/koz|glass|очк/.test(f)) return 'glasses';
  if (/atir|parf|perf|духи|парф/.test(f)) return 'perfume';
  return null;
}

function parsePrice(s) {
  if (!s) return null;
  let t = s.trim().toLowerCase().replace(/[₩]|won|вон|w$/g, '').trim();
  const k = t.endsWith('k');
  t = t.replace(/k$/, '').replace(/[\s.,]/g, '');
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t) * (k ? 1000 : 1);
  return n > 0 ? n : null;
}

// "Nike Dunk Low Panda - 89000 (2)" → { name, price, oldPrice, order: 2 }
function parseName(base) {
  let s = base.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  let order = 0;
  const m = s.match(/\s*(?:\((\d+)\)|#(\d+))$/);
  if (m) {
    order = Number(m[1] || m[2]);
    s = s.slice(0, m.index).trim();
  }

  const PRICE = '(\\d[\\d\\s.,]*k?)\\s*(?:₩|won|вон|w)?';
  const withDash = new RegExp(`^(.+?)\\s*[-–—=]\\s*${PRICE}(?:\\s*[-–—/]\\s*${PRICE})?$`, 'i');
  const plain = /^(.+?)\s+(\d[\d.,]*k?)\s*(?:₩|won|вон|w)?$/i;
  const r = s.match(withDash) || s.match(plain);
  if (!r) return null;

  const name = r[1].replace(/[\s\-–—=]+$/, '').trim();
  const price = parsePrice(r[2]);
  const oldPrice = parsePrice(r[3]);
  if (!name || !price) return null;
  return { name, price, oldPrice: oldPrice && oldPrice > price ? oldPrice : null, order };
}

function brandOf(name) {
  const low = name.toLowerCase().replace(/-/g, ' ');
  for (const [prefix, brand] of BRANDS) {
    if (low === prefix || low.startsWith(prefix + ' ')) return brand;
  }
  return name.split(/\s+/)[0];
}

function readExtras() {
  if (!fs.existsSync(EXTRA_FILE)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(EXTRA_FILE, 'utf8'));
    const out = {};
    for (const [k, v] of Object.entries(data)) if (!k.startsWith('_')) out[k.toLowerCase()] = v;
    return out;
  } catch (e) {
    console.log(`   ⚠️  tavsiflar.json o'qilmadi (${e.message}) — tavsifsiz yuklanadi`);
    return {};
  }
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'mahsulot';
}

// ---------------- 1. Papkani o'qish ----------------
function scan() {
  const products = new Map(); // key: cat|name
  const problems = [];

  const add = (cat, parsed, file) => {
    const key = cat + '|' + parsed.name.toLowerCase();
    if (!products.has(key)) {
      products.set(key, { cat, name: parsed.name, price: parsed.price, oldPrice: parsed.oldPrice, files: [] });
    }
    const p = products.get(key);
    if (parsed.price !== p.price) problems.push(`"${parsed.name}" — rasmlarda har xil narx yozilgan (${p.price} / ${parsed.price})`);
    p.files.push({ path: file, order: parsed.order });
  };

  for (const catDir of fs.readdirSync(INBOX, { withFileTypes: true })) {
    const full = path.join(INBOX, catDir.name);
    if (!catDir.isDirectory()) {
      if (IMAGE_EXT.test(catDir.name)) problems.push(`${catDir.name} — kategoriya papkasiga solinmagan`);
      continue;
    }
    if (catDir.name.startsWith('_')) continue;
    const cat = categoryOf(catDir.name);
    if (!cat) {
      problems.push(`"${catDir.name}" papkasi qaysi kategoriyaligi tushunilmadi (oyoq-kiyim / kozoynak / atir)`);
      continue;
    }

    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
      const entryPath = path.join(full, entry.name);
      if (entry.isDirectory()) {
        // Har bir mahsulot alohida papkada: "Nomi - narx/" ichida rasmlar
        const parsed = parseName(entry.name);
        if (!parsed) { problems.push(`${catDir.name}/${entry.name}/ — papka nomida narx topilmadi`); continue; }
        const imgs = fs.readdirSync(entryPath).filter((f) => IMAGE_EXT.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (!imgs.length) { problems.push(`${catDir.name}/${entry.name}/ — ichida rasm yo'q`); continue; }
        imgs.forEach((f, i) => add(cat, { ...parsed, order: i + 1 }, path.join(entryPath, f)));
      } else if (IMAGE_EXT.test(entry.name)) {
        const parsed = parseName(path.parse(entry.name).name);
        if (!parsed) { problems.push(`${catDir.name}/${entry.name} — nomida narx topilmadi`); continue; }
        add(cat, parsed, entryPath);
      } else if (/\.(heic|heif)$/i.test(entry.name)) {
        problems.push(`${catDir.name}/${entry.name} — HEIC format o'qilmaydi, JPG qilib saqlang`);
      }
    }
  }

  for (const p of products.values()) p.files.sort((a, b) => a.order - b.order);
  return { products: [...products.values()], problems };
}

// ---------------- 2. Rasmlarni tayyorlash ----------------
function prepareImages(products) {
  fs.mkdirSync(OUT, { recursive: true });
  const stamp = Date.now().toString(36);
  for (const p of products) {
    p.urls = [];
    p.files.forEach((f, i) => {
      const fileName = `${slugify(p.name)}-${stamp}-${i + 1}.jpg`;
      const dst = path.join(OUT, fileName);
      const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', RESIZE, '-Src', f.path, '-Dst', dst], { encoding: 'utf8' });
      if (r.status !== 0 || !fs.existsSync(dst)) {
        // Kichraytirib bo'lmasa — asl faylning o'zi
        const ext = path.extname(f.path).toLowerCase();
        const raw = fileName.replace(/\.jpg$/, ext);
        fs.copyFileSync(f.path, path.join(OUT, raw));
        p.urls.push('/uploads/mahsulot/' + raw);
      } else {
        p.urls.push('/uploads/mahsulot/' + fileName);
      }
    });
    process.stdout.write('.');
  }
  console.log('');
}

// ---------------- 3. GitHub'ga yuborish ----------------
function git(...args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function pushImages(count) {
  if (git('--version').status !== 0) return "git topilmadi";
  git('add', 'backend/uploads/mahsulot');
  const c = git('commit', '-m', `Mahsulot rasmlari yuklandi (${count} ta mahsulot)`, '--', 'backend/uploads/mahsulot');
  if (c.status !== 0 && !/nothing to commit|nothing added/.test(c.stdout + c.stderr)) return (c.stderr || c.stdout).trim();
  git('pull', '--rebase', '--autostash');
  const p = git('push');
  if (p.status !== 0) return (p.stderr || p.stdout).trim();
  return null;
}

// ---------------- 4. Bazaga yozish ----------------
async function saveToDb(products, hideOld) {
  const extras = readExtras();
  const cats = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  const keepIds = [];
  let created = 0;
  let updated = 0;

  for (const p of products) {
    const categoryId = cats[p.cat];
    if (!categoryId) throw new Error(`Bazada "${p.cat}" kategoriyasi yo'q. Avval npm run db:seed ni bir marta ishga tushiring.`);

    const existing = await prisma.product.findFirst({
      where: { categoryId, nameUz: { equals: p.name, mode: 'insensitive' } },
    });

    const extra = extras[p.name.toLowerCase()] || {};
    const texts = {
      ...(extra.brand ? { brand: extra.brand } : {}),
      ...(extra.nameRu ? { nameRu: extra.nameRu } : {}),
      ...(extra.descUz ? { descUz: extra.descUz } : {}),
      ...(extra.descRu ? { descRu: extra.descRu } : {}),
    };

    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          ...texts,
          price: p.price,
          oldPrice: p.oldPrice,
          isActive: true,
          images: { create: p.urls.map((url, i) => ({ url, sortOrder: i })) },
        },
      });
      keepIds.push(existing.id);
      updated++;
    } else {
      const sizes = p.cat === 'shoes' ? SHOE_SIZES : extra.variants?.length ? extra.variants : ['Standart'];
      const saved = await prisma.product.create({
        data: {
          nameUz: p.name,
          nameRu: p.name,
          brand: brandOf(p.name),
          ...texts,
          price: p.price,
          oldPrice: p.oldPrice,
          isNew: true,
          categoryId,
          images: { create: p.urls.map((url, i) => ({ url, sortOrder: i })) },
          variants: {
            create: sizes.map((label, i) => ({
              label,
              stock: p.cat === 'shoes' ? SHOE_STOCK : OTHER_STOCK,
              sortOrder: i,
            })),
          },
        },
      });
      keepIds.push(saved.id);
      created++;
    }
  }

  let hidden = 0;
  if (hideOld) {
    const r = await prisma.product.updateMany({
      where: {
        id: { notIn: keepIds },
        isActive: true,
        images: { none: { url: { startsWith: '/uploads/mahsulot/' } } },
      },
      data: { isActive: false },
    });
    hidden = r.count;
  }
  return { created, updated, hidden };
}

// ---------------- 5. Yuklanganlarni olib qo'yish ----------------
function archive(products) {
  const day = new Date().toISOString().slice(0, 10);
  const dirs = new Set();
  for (const p of products) {
    for (const f of p.files) {
      const rel = path.relative(INBOX, f.path);
      const dst = path.join(DONE, day, rel);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.renameSync(f.path, dst);
      const parent = path.dirname(f.path);
      if (path.dirname(parent) !== INBOX) dirs.add(parent); // mahsulot papkasi
    }
  }
  for (const d of dirs) {
    try { if (!fs.readdirSync(d).length) fs.rmdirSync(d); } catch { /* bo'sh emas */ }
  }
}

async function ask(rl, q) {
  if (AUTO_YES) return true;
  const a = (await rl.question(q + ' (ha / yo\'q): ')).trim().toLowerCase();
  return ['ha', 'h', 'y', 'yes', 'да', 'д'].includes(a);
}

async function main() {
  console.log('\n📦 MAHSULOTLAR papkasi o\'qilmoqda...\n');
  if (!fs.existsSync(INBOX)) {
    console.log('   MAHSULOTLAR papkasi topilmadi: ' + INBOX);
    return;
  }

  const { products, problems } = scan();

  const labels = { shoes: '👟', glasses: '🕶', perfume: '🧴' };
  for (const p of products) {
    const old = p.oldPrice ? `  (eski: ${money(p.oldPrice)})` : '';
    console.log(`   ${labels[p.cat]} ${p.name.padEnd(36)} ${money(p.price).padStart(10)}  ${p.files.length} ta rasm${old}`);
  }
  if (problems.length) {
    console.log('\n   ⚠️  Quyidagilar o\'tkazib yuboriladi:');
    for (const m of problems) console.log('      - ' + m);
  }
  if (!products.length) {
    console.log('\n   Yuklanadigan mahsulot yo\'q. MAHSULOTLAR/QOLLANMA.txt ni o\'qing.');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('');
    if (!(await ask(rl, `   ${products.length} ta mahsulot yuklansinmi?`))) return;

    const oldCount = await prisma.product.count({
      where: { isActive: true, images: { none: { url: { startsWith: '/uploads/mahsulot/' } } } },
    });
    let hideOld = false;
    if (oldCount > 0 && !AUTO_YES) {
      hideOld = await ask(rl, `   Do'konda ${oldCount} ta eski mahsulot bor. Ular yashirilsinmi? (o'chmaydi, admin paneldan qaytarsa bo'ladi)`);
    }

    console.log('\n   🖼  Rasmlar tayyorlanmoqda');
    prepareImages(products);

    console.log('   ☁️  Rasmlar GitHub\'ga yuborilmoqda...');
    const pushErr = pushImages(products.length);

    console.log('   🗄  Bazaga yozilmoqda...');
    const r = await saveToDb(products, hideOld);
    archive(products);

    console.log('');
    console.log(`   ✅ ${r.created} ta yangi mahsulot qo'shildi`);
    if (r.updated) console.log(`   ✅ ${r.updated} ta mahsulot yangilandi (nomi bir xil edi)`);
    if (r.hidden) console.log(`   🙈 ${r.hidden} ta eski mahsulot yashirildi`);
    console.log('   📁 Yuklangan rasmlar MAHSULOTLAR/_yuklangan/ ga olib qo\'yildi');

    if (pushErr) {
      console.log('\n   ⚠️  Rasmlar GitHub\'ga yuborilmadi:');
      console.log('      ' + pushErr.split('\n').join('\n      '));
      console.log('      Rasmlar saytda ko\'rinishi uchun GitHub Desktop orqali "Push" qiling.');
    } else {
      console.log('\n   ⏳ Rasmlar saytda 3-5 daqiqadan keyin ko\'rinadi (Render yangilanmoqda).');
    }
    console.log('   ✏️  Tavsif, ruscha nom va o\'lchamlarni admin paneldan to\'ldirishingiz mumkin.');
    console.log('\n🎉 Tayyor.\n');
  } finally {
    rl.close();
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Xatolik:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
