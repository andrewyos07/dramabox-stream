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
