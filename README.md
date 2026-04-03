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

## Environment

Variabel yang bisa diisi ada di `.env.example`.

Contoh:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Deploy

Proyek bisa dideploy ke Vercel atau platform lain yang mendukung Next.js.

## Catatan

Konten aplikasi ini adalah perencanaan berbasis data yang Anda masukkan, bukan pengganti saran medis profesional.
