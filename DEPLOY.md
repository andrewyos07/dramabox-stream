# Deploy ke Vercel

## Cara Deploy

### Opsi 1: Menggunakan Vercel CLI dengan npx (Paling Cepat & Mudah)

**Tidak perlu install global, langsung pakai npx:**

1. Masuk ke folder project:
```bash
cd dramabox-streaming
```

2. Deploy (preview):
```bash
npx vercel
```
   - Pertama kali akan diminta login (browser akan terbuka)
   - Ikuti instruksi di terminal
   - Akan dapat preview URL

3. Deploy ke production:
```bash
npx vercel --prod
```

**Keuntungan menggunakan npx:**
- ✅ Tidak perlu sudo/permission
- ✅ Tidak perlu install global
- ✅ Selalu pakai versi terbaru

### Opsi 2: Menggunakan GitHub Integration (Recommended)

1. **Push code ke GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard:**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub
   - Klik "Add New Project"
   - Pilih repository `dramabox-streaming`
   - Vercel akan otomatis detect Vite project
   - Klik "Deploy"

3. **Setelah deploy:**
   - Vercel akan memberikan URL production
   - Setiap push ke main branch akan auto-deploy
   - Pull request akan dapat preview URL

### Opsi 3: Drag & Drop (Quick Test)

1. Build project:
```bash
npm run build
```

2. Buka [vercel.com](https://vercel.com)
3. Login dan klik "Add New Project"
4. Pilih "Upload" dan drag folder `dist`
5. Deploy!

## Konfigurasi

File `vercel.json` sudah dikonfigurasi untuk:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Framework: Vite
- ✅ SPA routing: Semua route di-rewrite ke `/index.html`

## Catatan Penting

- ✅ Build sudah di-test dan berhasil
- ✅ Semua console.log sudah dihapus
- ✅ Aplikasi siap untuk production
- ✅ Mobile responsive sudah diimplementasikan

## Troubleshooting

Jika ada masalah saat deploy:
1. Pastikan Node.js version di Vercel >= 18
2. Check build logs di Vercel dashboard
3. Pastikan semua dependencies terinstall
