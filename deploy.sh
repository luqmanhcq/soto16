#!/bin/bash
# =============================================================
# DEPLOY SCRIPT — SI-SOTO (soto16)
# Jalankan script ini di server Linux tempat aplikasi berjalan
# =============================================================

set -e  # Hentikan jika ada error

APP_DIR="/var/www/soto16"    # ← SESUAIKAN dengan path di server Anda
APP_NAME="soto16"

echo "========================================"
echo "  DEPLOY SI-SOTO"
echo "========================================"

# 1. Masuk ke direktori app
cd "$APP_DIR"

# 2. Pull kode terbaru
echo "[1/5] Git pull..."
git pull origin main   # atau branch yang Anda gunakan

# 3. Install dependencies (skip jika tidak ada perubahan package.json)
echo "[2/5] Install dependencies..."
npm ci --production=false

# 4. Build aplikasi Next.js
echo "[3/5] Building Next.js..."
npm run build

# 5. Hentikan PM2 jika sedang running
echo "[4/5] Stop PM2 process..."
pm2 delete "$APP_NAME" 2>/dev/null || echo "  (proses tidak ditemukan, lanjut...)"

# 6. Start PM2 dengan ecosystem config
echo "[5/5] Start PM2..."
pm2 start ecosystem.config.cjs

# 7. Simpan config PM2 agar auto-start saat server reboot
pm2 save

echo ""
echo "✅ Deploy selesai!"
echo ""
echo "📋 Cek status:"
echo "   pm2 status"
echo "   pm2 logs $APP_NAME --lines 50"
echo ""
echo "🌐 Test koneksi:"
echo "   curl -I http://localhost:3001"
