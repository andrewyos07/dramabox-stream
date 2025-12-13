# DramaBox Streaming

Aplikasi streaming dan download drama berbasis React + Vite dengan desain mobile responsive.

## Fitur

- 🔍 **Pencarian Series** - Cari drama favorit Anda
- 📺 **Streaming Video** - Tonton drama langsung di browser
- ⬇️ **Download Video** - Download episode untuk ditonton offline
- 📱 **Mobile Responsive** - Desain yang optimal untuk mobile dan desktop
- 🎨 **Modern UI** - Interface yang modern dan user-friendly
- 🎯 **Multi Quality** - Pilih kualitas video yang diinginkan

## Teknologi

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React (Icons)

## Instalasi

1. Install dependencies:

```bash
npm install
# atau
bun install
```

2. Jalankan development server:

```bash
npm run dev
# atau
bun run dev
```

> **Catatan:** Backend proxy sekarang dipisah ke folder `../dramabox-streaming-backend` agar tidak lagi bercampur dengan frontend. Saat development jalankan dua terminal:
>
> 1. Terminal A (backend/proxy):
>
>    ```bash
>    cd /Volumes/WOWKWB - YOS/CODE/dramabox-streaming-backend
>    vercel dev --listen 3000 --debug
>    ```
>
>    Folder backend ini memuat sumber `api/` asli. Vercel CLI tidak akan lagi mencoba menjalankan Vite karena `framework` dipaksa `null`.
>
>    Jika Dramabox mengganti token atau device info, set environment variable berikut sebelum menjalankan `vercel dev` agar proxy memakai header baru:
>
>    - `DRAMABOX_TN`
>    - `DRAMABOX_USER_ID`
>    - `DRAMABOX_DEVICE_ID`
>    - `DRAMABOX_ANDROID_ID`
>    - `DRAMABOX_CID`, `DRAMABOX_BRAND`, `DRAMABOX_MODEL`, `DRAMABOX_MANUFACTURER`
>    - `DRAMABOX_VERSION`, `DRAMABOX_VERSION_NAME`
>      Contoh:
>
>    ```bash
>    export DRAMABOX_TN='Bearer xxx'
>    export DRAMABOX_USER_ID='336084056'
>    vercel dev --listen 3000 --debug
>    ```
>
> 2. Terminal B (frontend):
>    ```bash
>    cd /Volumes/WOWKWB - YOS/CODE/dramabox-streaming
>    npm run dev
>    ```
>
> Vite (`localhost:5173`) otomatis mem-proxy `/api/*` ke backend di `localhost:3000`, sehingga semua episode akan terbuka seperti di downloader.

3. Build untuk production:

```bash
npm run build
# atau
bun run build
```

## Penggunaan

1. **Pencarian**: Masukkan kata kunci di search bar untuk mencari drama
2. **Pilih Series**: Klik pada card series untuk melihat detail
3. **Streaming**: Pilih episode dan video akan mulai diputar
4. **Download**: Klik tombol download untuk mengunduh episode

## Struktur Project

```
src/
├── components/       # Komponen reusable
│   ├── SearchBar.tsx
│   ├── SeriesCard.tsx
│   ├── SeriesList.tsx
│   └── VideoPlayer.tsx
├── pages/           # Halaman aplikasi
│   ├── Home.tsx
│   └── SeriesDetail.tsx
├── services/        # API services
│   └── dramaboxApi.ts
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Catatan

Aplikasi ini menggunakan API dari DramaBox untuk mendapatkan data series dan video. Pastikan koneksi internet stabil untuk pengalaman streaming yang optimal.
