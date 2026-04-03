// ============================================================
// SKINCARE SEED DATA — arunav2
// Jadwal diperbarui dari jadwal_harian.txt
// CONFLICT dengan 2.pdf dicatat eksplisit
// ============================================================

import type { SkincareDay } from "@/types";

// ---- Produk Reference ----
export const PRODUCTS = {
  MICELLAR: {
    name: "Glad2Glow Cherry Blossom Betaine Micellar Water",
    short: "G2G Micellar Water",
    note: "Langkah PERTAMA malam hari. Usapkan kapas secara perlahan searah (gentle swipe — jangan digosok kuat).",
  },
  FACIAL_WASH: {
    name: "Makarizo Barber Daily Bright Radiace Facial Wash",
    short: "Makarizo Facial Wash",
    note: "Ukuran almond, busakan, pijat 45 detik, bilas.",
    warning: "Mengandung fragrans (parfum) dan Menthol — lakukan patch test di rahang bawah jika ada riwayat atopi.",
  },
  SERUM: {
    name: "Serum (Glad2Glow 10% Niacinamide Power Bright Serum)",
    short: "Serum Niacinamide 10%",
    note: "2–3 tetes, pijat lembut ke arah atas pada wajah lembap sebelum pelembap.",
    warning: "⚠️ Konsentrasi 10% dapat menyebabkan eritema transien (kemerahan) di menit pertama. Jika terlalu kuat, campurkan langsung dengan pelembap.",
  },
  MOISTURIZER_POMEGRANATE: {
    name: "Glad2Glow Pomegranate 5% Niacinamide Brightening Moisturizer",
    short: "Pomegranate Brightening Moist",
    note: "Oleskan merata ke seluruh wajah.",
    warning: "Agen pencerah pigmen meningkatkan sensitivitas UV — WAJIB ditutup tabir surya jika pagi hari.",
  },
  SUNSCREEN: {
    name: "Azarine Hydrasoothe Sunscreen Gel SPF45 PA++++",
    short: "Azarine SPF45 PA++++",
    note: "Dosis MUTLAK: dua garis lurus di jari telunjuk dan tengah. Langkah TERAKHIR pagi. Aplikasikan 15 menit sebelum paparan sinar.",
    warning: "⚠️ WAJIB re-aplikasi setiap 2 jam di luar ruangan. Usap keringat dengan tisu KERING (bukan tisu basah beralkohol) lalu oleskan ulang.",
  },
  CERAMIDE_MOIST: {
    name: "Glad2Glow Blueberry Moisturizer 5% Ceramide",
    short: "G2G Blueberry 5% Ceramide",
    note: "Lapisan penutup akhir malam hari. Sangat aman — bebas kontraindikasi besar. Aplikasikan dalam porsi cukup.",
  },
  CLAY_VOLCANO: {
    name: "Glad2Glow Volcano Salicylic Acid Acne Control Clay Mask Stick",
    short: "G2G Volcano BHA Clay Stick",
    note: "Aplikasikan KHUSUS pada zona T (dahi, hidung, dagu) atau area berminyak/berjerawat. Diamkan 10–15 menit, bilas basah.",
    warning: "⛔ JANGAN biarkan mengering hingga retak keras (dehidrasi sekunder). ⛔ DILARANG digabung dengan Exfoliating Toner di malam yang sama.",
  },
  CLAY_POMEGRANATE: {
    name: "Glad2Glow Pomegranate Niacinamide Brightening Clay Stick",
    short: "G2G Pomegranate Brightening Clay Stick",
    note: "Aplikasikan pada area NON-berminyak (pipi, dahi, area lain). Diamkan TEPAT 10–15 menit, emulsi dengan air, bilas tuntas.",
    warning: "⚠️ JANGAN biarkan mengering hingga retak keras di wajah (menarik air dari stratum corneum → dehidrasi sekunder).",
  },
  AHA_BHA_TONER: {
    name: "Glad2Glow Blackberry AHA BHA PHA Daily Exfoliating Toner",
    short: "G2G AHA BHA PHA Toner",
    note: "Aplikasikan dengan telapak tangan atau kapas ke kulit KERING setelah double cleansing.",
    warning: "⚠️ Meskipun label 'Daily', PDF merekomendasikan maksimal 2–3x per minggu untuk mencegah over-exfoliation. Jadwal ini menggunakan 2x/minggu (Rabu & Minggu) — sesuai batas aman.",
  },
  BODY_LOTION: {
    name: "Marina Hand Body Lotion UV White",
    short: "Marina Body Lotion",
    note: "Oleskan pada leher, ekstremitas, dan trunkus setelah mandi (kulit masih agak lembap).",
    warning: "⛔ DILARANG UNTUK WAJAH. Stearic Acid dan Titanium Dioxide makro sangat komedogenik bagi folikel wajah. Hanya dari garis rahang ke bawah.",
  },
};

// ====================================================================
// SKINCARE SCHEDULE — Dari jadwal_harian.txt
// Pagi: SERAGAM setiap hari
// Malam: Berbeda per hari (Normal / Masker / Eksfoliasi)
// ====================================================================

// Pola malam berdasarkan hari:
// Senin (1), Kamis (4), Sabtu (6) → Normal
// Selasa (2), Jumat (5)           → Multi-Masking
// Rabu (3), Minggu (7)            → Eksfoliasi

type NightType = "normal" | "masking" | "eksfoliasi";

const NIGHT_TYPE_MAP: Record<number, NightType> = {
  1: "normal",    // Senin
  2: "masking",   // Selasa
  3: "eksfoliasi",// Rabu
  4: "normal",    // Kamis
  5: "masking",   // Jumat
  6: "normal",    // Sabtu
  7: "eksfoliasi",// Minggu
};

const NIGHT_LABELS: Record<NightType, string> = {
  normal: "Malam Normal",
  masking: "Malam Masker (Multi-Masking)",
  eksfoliasi: "Malam Eksfoliasi",
};

const NIGHT_PHASES: Record<NightType, SkincareDay["phase"]> = {
  normal: "stabilitas",
  masking: "pencerahan",
  eksfoliasi: "pencerahan",
};

// ---- Rutinitas pagi SERAGAM setiap hari ----
const AM_ROUTINE_DAILY = [
  {
    order: 1,
    product: PRODUCTS.FACIAL_WASH.name,
    productShort: PRODUCTS.FACIAL_WASH.short,
    notes: PRODUCTS.FACIAL_WASH.note,
    warningNote: PRODUCTS.FACIAL_WASH.warning,
  },
  {
    order: 2,
    product: PRODUCTS.SERUM.name,
    productShort: PRODUCTS.SERUM.short,
    notes: PRODUCTS.SERUM.note,
    warningNote: PRODUCTS.SERUM.warning,
  },
  {
    order: 3,
    product: PRODUCTS.MOISTURIZER_POMEGRANATE.name,
    productShort: PRODUCTS.MOISTURIZER_POMEGRANATE.short,
    notes: PRODUCTS.MOISTURIZER_POMEGRANATE.note,
    warningNote: PRODUCTS.MOISTURIZER_POMEGRANATE.warning,
  },
  {
    order: 4,
    product: PRODUCTS.SUNSCREEN.name,
    productShort: PRODUCTS.SUNSCREEN.short,
    notes: PRODUCTS.SUNSCREEN.note,
    warningNote: PRODUCTS.SUNSCREEN.warning,
  },
];

// ---- Rutinitas malam Normal (Senin, Kamis, Sabtu) ----
const PM_NORMAL = [
  { order: 1, product: PRODUCTS.MICELLAR.name, productShort: PRODUCTS.MICELLAR.short, notes: PRODUCTS.MICELLAR.note },
  { order: 2, product: PRODUCTS.FACIAL_WASH.name, productShort: PRODUCTS.FACIAL_WASH.short, notes: "Second cleanser setelah micellar water" },
  { order: 3, product: PRODUCTS.SERUM.name, productShort: PRODUCTS.SERUM.short, notes: PRODUCTS.SERUM.note, warningNote: PRODUCTS.SERUM.warning },
  { order: 4, product: PRODUCTS.CERAMIDE_MOIST.name, productShort: PRODUCTS.CERAMIDE_MOIST.short, notes: PRODUCTS.CERAMIDE_MOIST.note },
];

// ---- Rutinitas malam Masker / Multi-Masking (Selasa, Jumat) ----
const PM_MASKING = [
  { order: 1, product: PRODUCTS.MICELLAR.name, productShort: PRODUCTS.MICELLAR.short, notes: PRODUCTS.MICELLAR.note },
  { order: 2, product: PRODUCTS.FACIAL_WASH.name, productShort: PRODUCTS.FACIAL_WASH.short, notes: "Second cleanser setelah micellar water" },
  {
    order: 3,
    product: "Multi-Masking: Volcano BHA Clay Stick + Pomegranate Brightening Clay Stick",
    productShort: "Multi-Masking (2 Masker Sekaligus)",
    notes:
      "Volcano BHA Clay Stick → zona T (dahi, hidung, dagu) / area berminyak & berjerawat. " +
      "Pomegranate Brightening Clay Stick → pipi dan area lainnya. " +
      "Diamkan TEPAT 10–15 menit bersamaan, emulsi dengan air, bilas tuntas.",
    warningNote:
      "⚠️ JANGAN biarkan kedua masker mengering hingga retak keras — menarik air dari stratum corneum (dehidrasi sekunder). " +
      "⛔ JANGAN digabung dengan Exfoliating Toner di malam yang sama.",
  },
  { order: 4, product: PRODUCTS.SERUM.name, productShort: PRODUCTS.SERUM.short, notes: PRODUCTS.SERUM.note, warningNote: PRODUCTS.SERUM.warning },
  { order: 5, product: PRODUCTS.CERAMIDE_MOIST.name, productShort: PRODUCTS.CERAMIDE_MOIST.short, notes: "Penutup ceramide wajib setelah masker — merestorasi lipid yang terserap kaolin" },
];

// ---- Rutinitas malam Eksfoliasi (Rabu, Minggu) ----
const PM_EKSFOLIASI = [
  { order: 1, product: PRODUCTS.MICELLAR.name, productShort: PRODUCTS.MICELLAR.short, notes: PRODUCTS.MICELLAR.note },
  { order: 2, product: PRODUCTS.FACIAL_WASH.name, productShort: PRODUCTS.FACIAL_WASH.short, notes: "Second cleanser setelah micellar water" },
  {
    order: 3,
    product: PRODUCTS.AHA_BHA_TONER.name,
    productShort: PRODUCTS.AHA_BHA_TONER.short,
    notes: PRODUCTS.AHA_BHA_TONER.note,
    warningNote: PRODUCTS.AHA_BHA_TONER.warning,
  },
  { order: 4, product: PRODUCTS.SERUM.name, productShort: PRODUCTS.SERUM.short, notes: PRODUCTS.SERUM.note, warningNote: PRODUCTS.SERUM.warning },
  { order: 5, product: PRODUCTS.CERAMIDE_MOIST.name, productShort: PRODUCTS.CERAMIDE_MOIST.short, notes: "Penutup ceramide wajib pasca eksfoliasi — mengekang lonjakan TEWL" },
];

const PM_WARNINGS: Record<NightType, string[]> = {
  normal: [],
  masking: [
    "⛔ DILARANG: Multi-Masking + Exfoliating Toner di malam yang sama",
    "⚠️ Diamkan masker TEPAT 10–15 menit — jangan sampai mengering dan retak",
    "✅ Ceramide wajib sebagai penutup pasca masker",
  ],
  eksfoliasi: [
    "⛔ DILARANG: Exfoliating Toner + Clay Mask BHA di malam yang sama",
    "⚠️ Besok pagi wajib sunscreen ketat — kulit pasca eksfoliasi lebih sensitif UV",
    "✅ Ceramide wajib sebagai penutup pasca toner asam",
    "ℹ️ 2x per minggu (Rabu & Minggu) — sesuai batas aman 2–3x/minggu dari 2.pdf",
  ],
};

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// ---- Build SKINCARE_SCHEDULE ----
export const SKINCARE_SCHEDULE: SkincareDay[] = [1, 2, 3, 4, 5, 6, 7].map(
  (d) => {
    const dayIndex = d as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    const nightType = NIGHT_TYPE_MAP[d];

    const pmMap: Record<NightType, typeof PM_NORMAL> = {
      normal: PM_NORMAL,
      masking: PM_MASKING,
      eksfoliasi: PM_EKSFOLIASI,
    };

    return {
      dayIndex,
      dayName: DAY_NAMES[d - 1],
      phase: NIGHT_PHASES[nightType],
      amLabel: "Rutin Pagi (Setiap Hari)",
      pmLabel: NIGHT_LABELS[nightType],
      isRecoveryDay: false,
      amRoutine: AM_ROUTINE_DAILY,
      pmRoutine: pmMap[nightType],
      warnings: PM_WARNINGS[nightType],
    };
  }
);

// ---- Aturan Wajib Skincare ----
export const SKINCARE_RULES = {
  sunscreenReapply: {
    title: "Mandat Re-aplikasi Tabir Surya",
    rule: "Wajib re-aplikasi Azarine SPF45 setiap 2 jam selama di luar ruangan",
    howTo: "Usap keringat dengan tisu KERING (bukan tisu basah beralkohol), oleskan gel merata ke dahi, pipi, dan dagu",
    why: "Gel water-based berevaporasi lebih cepat. Keringat tropis melarutkan filter UV. Fotodegradasi Avobenzone terjadi setelah paparan berulang",
  },
  patchTest: {
    title: "Uji Tempel — Wajib Sebelum Mulai",
    products: ["G2G AHA BHA PHA Exfoliating Toner", "G2G 10% Niacinamide Power Bright Serum"],
    method: "Oleskan setetes produk di leher lateral atau dalam siku selama 24 jam. Absennya gatal, pembengkakan, atau nyeri melegitimasi penggunaan aman di wajah.",
  },
  bodyLotionRule: {
    title: "Marina Body Lotion — DILARANG untuk Wajah",
    rule: "Hanya dari garis rahang ke bawah",
    why: "Viskositas tinggi, Stearic Acid, dan Titanium Dioxide makro sangat komedogenik bagi folikel wajah",
  },
  overExfoliationSignal: {
    title: "⚠️ Sinyal Sawar Rusak — Washout Emergency",
    symptoms: ["Kulit tiba-tiba merah dan terasa 'cekit-cekit' / sensasi terbakar saat pakai pelembap biasa"],
    action: "HENTIKAN SEKETIKA semua AHA/BHA Toner dan Clay Mask selama 5–7 hari",
    washoutRoutine: "Hanya: Makarizo Facial Wash (malam) → Blueberry Ceramide → Azarine SPF45 (pagi)",
  },
  multiMaskingRule: {
    title: "Aturan Multi-Masking (Selasa & Jumat)",
    rules: [
      "Volcano BHA Clay Stick → zona T (dahi, hidung, dagu) dan area berminyak/berjerawat",
      "Pomegranate Brightening Clay Stick → pipi dan area NON-berminyak",
      "Kedua masker diaplikasikan dan didiamkan BERSAMAAN selama 10–15 menit",
      "Emulsi dengan air lalu bilas tuntas",
      "JANGAN biarkan mengering sampai retak keras",
    ],
  },
};
