#!/bin/bash
# Videolar uchun muhit: PostgreSQL (demo baza) + backend + miniapp + admin (Linux, Node 20+).
# Haqiqiy ma'lumotlar ishlatilmaydi — baza seed.js + data/demo-fix.sql bilan to'ldiriladi.
set -e
cd "$(dirname "$0")/.."
PGDATA=${PGDATA:-/var/lib/lusso-pg/data}
PGBIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
if [ ! -d "$PGDATA" ]; then
  mkdir -p "$PGDATA" && chown -R postgres "$(dirname "$PGDATA")"
  su postgres -c "$PGBIN/initdb -D $PGDATA -A trust -U postgres" >/dev/null
fi
su postgres -c "$PGBIN/pg_ctl -D $PGDATA -l $PGDATA/../log -o '-p 5432 -k /tmp' start" || true
sleep 2
psql -h 127.0.0.1 -U postgres -tc "select 1 from pg_database where datname='lusso'" | grep -q 1 || psql -h 127.0.0.1 -U postgres -c "create database lusso"
export DATABASE_URL=postgresql://postgres@127.0.0.1:5432/lusso
[ -f backend/.env ] || printf 'DATABASE_URL=%s\nPORT=5000\nADMIN_PASSWORD=demo1234\n' "$DATABASE_URL" > backend/.env
(cd backend && npm ci --silent && npx prisma db push --skip-generate >/dev/null && npx prisma generate >/dev/null && node prisma/seed.js)
psql -q -h 127.0.0.1 -U postgres lusso -f video/data/demo-fix.sql
(cd miniapp && npm ci --silent) && (cd admin && npm ci --silent)
(cd backend && nohup node src/index.js > /tmp/lusso-backend.log 2>&1 &)
(cd miniapp && nohup npx vite --port 5173 --strictPort > /tmp/lusso-mini.log 2>&1 &)
(cd admin && nohup npx vite --port 5174 --strictPort > /tmp/lusso-admin.log 2>&1 &)
sleep 5 && echo "✓ backend :5000, miniapp :5173, admin :5174"
