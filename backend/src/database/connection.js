// PostgreSQL (Neon) ulanishi — Prisma orqali
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('🗄️  Baza: ulandi (PostgreSQL / Neon)');
    return true;
  } catch (err) {
    console.error('❌ Bazaga ulanib bo\'lmadi. .env dagi DATABASE_URL ni tekshiring.');
    console.error('   ' + err.message);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;
