// LUSSO BRAND KR — asosiy ishga tushirish fayli
import express from 'express';
import cors from 'cors';
import config from './config/default.js';
import { connectDatabase } from './database/connection.js';
import bot, { hasBot } from './core/bot.js';
import registerBotHandlers from './routes/bot.routes.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(config.uploadsDir));

app.get('/', (req, res) => {
  res.json({
    shop: config.shop.name,
    status: 'ishlayapti ✅',
    bot: hasBot ? 'ulangan' : 'token yo\'q',
    miniApp: config.webAppUrl || 'ngrok sozlanmagan',
  });
});

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// Xatoliklarni ushlash
app.use((err, req, res, next) => {
  console.error('❌ API xatosi:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server xatosi' });
});

async function start() {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log('');
    console.log('🛍  ' + config.shop.name);
    console.log('   API:          http://localhost:' + config.port);
    console.log('   Admin panel:  http://localhost:5174');
    console.log('   Mini App:     http://localhost:5173');
    console.log('');
    console.log('   📱 Telefondan (bir xil Wi-Fi da):');
    console.log('      Admin panel:  ' + config.adminUrl);
    console.log('      Mini App:     http://' + config.lanIp + ':5173');
    console.log('');
  });

  if (hasBot) {
    registerBotHandlers(bot);
    await bot.api.deleteWebhook({ drop_pending_updates: false }).catch(() => {});
    bot.start({
      onStart: (info) => console.log('🤖 Bot ishga tushdi: @' + info.username),
    });
  } else {
    console.log('🤖 Bot ishga tushmadi — .env dagi BOT_TOKEN ni to\'ldiring');
  }
}

async function stop() {
  console.log('\n👋 To\'xtatilmoqda...');
  if (hasBot) await bot.stop();
  process.exit(0);
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

// Kutilmagan xatolik serverni o'chirib qo'ymasligi uchun
process.on('unhandledRejection', (err) => {
  console.error('⚠️  Ushlanmagan xatolik:', err?.message || err);
});

start();
