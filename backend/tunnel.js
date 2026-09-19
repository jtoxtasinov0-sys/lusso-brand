/**
 * Do'kon va admin panelni internetga chiqaradi.
 *
 *   node tunnel.js
 *
 * Nima qiladi:
 *   1. Mini App (5173) uchun https manzil oladi → Telegram tugmasiga ulaydi
 *   2. Admin panel (5174) uchun https manzil oladi → botdagi /panel shuni beradi
 *   3. Ikkalasini bazaga va .env ga yozadi
 *
 * Manzillar har safar o'zgaradi, lekin skript ularni o'zi yangilaydi.
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './src/config/default.js';
import prisma from './src/database/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '.env');

const CANDIDATES = [
  'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
  'C:\\Program Files\\cloudflared\\cloudflared.exe',
  'cloudflared',
];

function findCloudflared() {
  for (const c of CANDIDATES) {
    if (c === 'cloudflared' || fs.existsSync(c)) return c;
  }
  return 'cloudflared';
}

const BIN = findCloudflared();
const found = {}; // { shop: url, admin: url }

function setEnv(key, value) {
  try {
    let env = fs.readFileSync(ENV_PATH, 'utf8');
    const re = new RegExp(`${key}=".*"`);
    env = re.test(env) ? env.replace(re, `${key}="${value}"`) : env + `\n${key}="${value}"\n`;
    fs.writeFileSync(ENV_PATH, env);
  } catch (err) {
    console.error(`   ⚠️  .env yangilanmadi (${key}):`, err.message);
  }
}

async function saveToDb(field, url) {
  try {
    await prisma.setting.upsert({
      where: { id: 1 },
      update: { [field]: url },
      create: { id: 1, [field]: url },
    });
  } catch (err) {
    console.error('   ⚠️  Bazaga yozilmadi:', err.message);
  }
}

async function setMenuButton(url) {
  if (!config.botToken) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: { type: 'web_app', text: "🛍 Do'kon", web_app: { url } },
      }),
    });
    const data = await res.json();
    console.log(data.ok ? '   ✅ Telegram tugmasi ulandi' : `   ⚠️  Telegram: ${data.description}`);
  } catch (err) {
    console.error('   ⚠️  Telegramga ulanmadi:', err.message);
  }
}

function done() {
  if (!found.shop || !found.admin) return;
  console.log('\n' + '='.repeat(58));
  console.log('  ✅ TAYYOR');
  console.log('');
  console.log("  🛍 Do'kon:       botda /start");
  console.log('  🖥 Admin panel:  ' + found.admin);
  console.log('     Parol:        ' + config.adminPassword);
  console.log('');
  console.log('  ⚠️  Bu oyna yopilsa, ikkala manzil ham ishlamay qoladi');
  console.log('='.repeat(58) + '\n');
}

function openTunnel({ name, port, label, onUrl }) {
  const proc = spawn(BIN, ['tunnel', '--url', `http://localhost:${port}`, '--no-autoupdate'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let captured = false;

  const onData = async (buf) => {
    const match = buf.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (!match || captured) return;
    captured = true;

    const url = match[0];
    console.log(`\n${label}\n   🔗 ${url}`);
    await onUrl(url);
    found[name] = url;
    done();
  };

  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);

  proc.on('error', (err) => {
    console.error('\n❌ cloudflared ishga tushmadi:', err.message);
    console.error('   https://github.com/cloudflare/cloudflared/releases dan yuklab oling');
    process.exit(1);
  });

  return proc;
}

console.log('🌐 Tunnellar ochilmoqda (10-20 soniya)...');

const shopProc = openTunnel({
  name: 'shop',
  port: 5173,
  label: "🛍 DO'KON (Mini App)",
  onUrl: async (url) => {
    await saveToDb('webAppUrl', url);
    setEnv('WEB_APP_URL', url);
    await setMenuButton(url);
  },
});

const adminProc = openTunnel({
  name: 'admin',
  port: 5174,
  label: '🖥 ADMIN PANEL',
  onUrl: async (url) => {
    await saveToDb('adminUrl', url);
    setEnv('ADMIN_PANEL_URL', url);
    console.log('   ✅ Botdagi /panel shu manzilni beradi');
  },
});

const stop = () => {
  shopProc.kill();
  adminProc.kill();
  process.exit(0);
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
