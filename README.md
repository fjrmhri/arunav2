# arunav2

Aplikasi tracker kesehatan berbasis Next.js untuk jadwal kebugaran, nutrisi, puasa 36 jam, suplemen, dan skincare.

## Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Firebase Firestore opsional
- localStorage sebagai fallback

## Fitur

- Dashboard ringkasan harian
- Planner mingguan untuk olahraga, nutrisi, puasa, suplemen, dan skincare
- Daily tracker dengan progress checklist
- Safety notes dan asumsi penting dari data program
- Penyimpanan data via Firebase atau localStorage
- Bisa di-install di mobile sebagai PWA

## Struktur Singkat

```text
src/
  app/           route aplikasi
  components/    komponen UI dan dashboard
  data/          seed data fitness, skincare, safety
  hooks/         state dan logic tracker
  lib/           utilitas dan adapter Firebase
  types/         tipe TypeScript
```

## Menjalankan Lokal

1. Install dependency

```bash
npm install
```

2. Buat file environment lokal

```bash
copy .env.example .env.local
```

3. Isi `.env.local` jika ingin memakai Firebase.
Jika tidak diisi, aplikasi tetap berjalan dengan localStorage.

4. Jalankan development server

```bash
npm run dev
```

5. Build production

```bash
npm run build
npm run start
```

## Script

- `npm run dev` menjalankan server development
- `npm run build` membuat build production
- `npm run start` menjalankan hasil build
- `npm run lint` menjalankan ESLint
- `npm run typecheck` menjalankan pemeriksaan TypeScript
- `npm test` menjalankan unit test (Vitest)

## Environment

Semua variabel ada di `.env.example`:

- `NEXT_PUBLIC_FIREBASE_*` dan `NEXT_PUBLIC_FCM_VAPID_KEY` untuk push notification FCM.
- `SYNC_SECRET`, `GITHUB_TOKEN`, `GITHUB_OBSIDIAN_REPO`, `GITHUB_OBSIDIAN_BRANCH` untuk sync ke Obsidian (server-side saja).

## Pengaturan

Halaman `/settings` (ikon roda gigi di dashboard) untuk:

- Tanggal mulai program dan tanggal mulai puasa 36 jam terakhir (anchor siklus 14 hari).
- Sync Secret untuk sync Obsidian.

## Sync Obsidian

Endpoint `POST /api/sync-obsidian` hanya menerima request dengan header `Authorization: Bearer <SYNC_SECRET>`. Tanpa `SYNC_SECRET` di server, endpoint menolak semua request.

1. Buat secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. Isi `SYNC_SECRET`, `GITHUB_TOKEN` (fine-grained, akses Contents: Read and write hanya ke repo vault), dan `GITHUB_OBSIDIAN_REPO` di Vercel > Settings > Environment Variables, lalu redeploy.
3. Isi secret yang sama di halaman Pengaturan aplikasi, lalu tekan `Sync sekarang`.

## Deploy

Proyek dideploy ke Vercel. Push ke GitHub memicu deploy otomatis.

## Install di Mobile

- Android Chrome: buka website yang sudah di-deploy via HTTPS, lalu pilih `Install app` atau `Add to Home screen`.
- iPhone Safari: buka website, tekan `Share`, lalu pilih `Add to Home Screen`.
- Saat development, service worker hanya aktif pada build production, jadi uji PWA dengan `npm run build` lalu `npm run start` atau setelah deploy.

## Catatan

Konten aplikasi ini adalah perencanaan berbasis data yang Anda masukkan, bukan pengganti saran medis profesional.
