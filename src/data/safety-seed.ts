// ============================================================
// SAFETY NOTES — Langsung dari 1.pdf dan 2.pdf
// Semua warning, UNKNOWN, ASSUMPTION, dan CONFLICT
// ============================================================

import type { SafetyNote } from "@/types";

export const SAFETY_NOTES: SafetyNote[] = [
  // ============================================================
  // MEDICAL ASSUMPTIONS (dari 1.pdf, Bab 1)
  // ============================================================
  {
    id: "med-001",
    category: "medical",
    severity: "unknown",
    title: "ASSUMPTION: Usia Subjek — Ditetapkan 30 Tahun",
    body: "Usia subjek berstatus UNKNOWN. Parameter usia krusial untuk menentukan BMR dan kapasitas pemulihan selular. ASSUMED: 30 tahun (rentang reproduktif dewasa pertengahan). Jika usia berbeda secara signifikan, kalkulasi TDEE dan target kalori 1.930 kkal perlu dikalkulasi ulang.",
    source: "1.pdf",
    tag: "ASSUMPTION",
  },
  {
    id: "med-002",
    category: "medical",
    severity: "warning",
    title: "ASSUMPTION: Status Tekanan Darah — Ditetapkan Normal",
    body: "Riwayat medis spesifik, profil tekanan darah, dan obat-obatan rutin berstatus UNKNOWN. ASSUMED: normotensi (<120/80 mmHg) dan tidak ada penyakit kardiovaskular koroner tersembunyi. Puasa panjang (36 jam) pada individu dengan patologi jantung atau konsumsi agen antihipertensi/diuretik dapat memicu fluktuasi elektrolit yang berujung hipotensi ortostatik akut atau aritmia.",
    source: "1.pdf",
    tag: "ASSUMPTION",
  },
  {
    id: "med-003",
    category: "medical",
    severity: "warning",
    title: "ASSUMPTION: Tidak Ada GERD / Gastritis Kronis",
    body: "ASSUMED tidak ada refluks gastroesofageal (GERD) atau gastritis kronis. Intervensi puasa yang dikombinasikan dengan konsumsi kafein (kopi hitam atau Hemaviton) pada lambung kosong dapat merelaksasi sfingter esofagus bawah dan menstimulasi hipersekresi asam lambung. Individu dengan riwayat GERD perlu konsultasi dokter sebelum menjalankan puasa 36 jam.",
    source: "1.pdf",
    tag: "ASSUMPTION",
  },
  {
    id: "med-004",
    category: "medical",
    severity: "warning",
    title: "ASSUMPTION: Fungsi Ginjal dan Hati Normal",
    body: "Kapasitas fungsi ginjal dan hepatik berstatus UNKNOWN. ASSUMED: laju filtrasi glomerulus (eGFR) normal dan rasio enzim hati (ALT/AST) dalam batas referensi sehat. Diperlukan karena program ini merekomendasikan asupan protein signifikan (135g/hari) dan fase pemeliharaan Creatine Monohydrate harian. Ginjal yang sehat mengekskresikan kreatinin tanpa memicu toksisitas nefron.",
    source: "1.pdf",
    tag: "ASSUMPTION",
  },
  {
    id: "med-005",
    category: "medical",
    severity: "warning",
    title: "ASSUMPTION: Tidur Terkelola 7–8 Jam Per Malam",
    body: "Pola tidur dan manajemen stres berstatus UNKNOWN. ASSUMED: 7–8 jam per malam. Defisit tidur menyebabkan elevasi kortisol → resistensi insulin sekunder → retensi cairan → moon face/puffy face. Kualitas tidur fundamental untuk menekan kortisol dan mendukung hipertrofi otot.",
    source: "1.pdf",
    tag: "ASSUMPTION",
  },
  {
    id: "med-006",
    category: "medical",
    severity: "danger",
    title: "MANDAT KLINIS: Konsultasi Dokter Sebelum Memulai Program",
    body: "Seluruh rancangan modul ini berstatus evidence-based theoretical planning dan BUKAN substitusi mutlak bagi diagnosis kedokteran personal dari fasilitas kesehatan primer. Jika SALAH SATU dari asumsi medis tidak merepresentasikan realitas fisiologis subjek, evaluasi medis bersama dokter berlisensi menjadi mandat mutlak sebelum inisiasi program.",
    source: "1.pdf",
    tag: "WARNING",
  },

  // ============================================================
  // FASTING WARNINGS (dari 1.pdf, Bab 5 & 7)
  // ============================================================
  {
    id: "fast-001",
    category: "fasting",
    severity: "danger",
    title: "🔴 RED FLAG: Hentikan Puasa Seketika Jika...",
    body: "Hentikan puasa SEKETIKA jika mengalami: (1) Palpitasi jantung berdebar tidak beratur (aritmia sekunder hipokalemia) → konsumsi air + sejumput gula/sari buah. (2) Kelelahan visual / pandangan gelap mendadak saat berdiri (hipotensi ortostatik) → berbaring, minum air. (3) Tremor atau disorientasi akut (hipoglikemia) → konsumsi gula segera.",
    source: "1.pdf",
    tag: "DANGER",
  },
  {
    id: "fast-002",
    category: "fasting",
    severity: "danger",
    title: "⛔ Kontraindikasi Fatal Puasa Panjang",
    body: "Puasa 36 jam DILARANG MUTLAK tanpa persetujuan dokter jika subjek memiliki: fluktuasi tiroid, riwayat aritmia, disfungsi lambung berlebih (hipersekresi asam lambung), sedang mengonsumsi agen antihipertensi atau diuretik.",
    source: "1.pdf",
    tag: "DANGER",
  },
  {
    id: "fast-003",
    category: "fasting",
    severity: "warning",
    title: "⚠️ Refeeding Syndrome — Bahaya Berbuka Sembarangan",
    body: "Kesalahan fatal: berbuka dengan beban karbohidrat besar. Menyebabkan glukosa menembus membran sel cepat, menarik kalium dan magnesium ke dalam sel → kadar elektrolit serum anjlok mendadak (Refeeding Syndrome). Protokol: mulai dengan bone broth atau 1–2 putih telur rebus, tunggu 30–60 menit, baru makan substansial. ⛔ Makanan gorengan/warteg dilarang sebagai makanan pertama pasca-puasa.",
    source: "1.pdf",
    tag: "WARNING",
  },
  {
    id: "fast-004",
    category: "fasting",
    severity: "warning",
    title: "⚠️ Elektrolit Wajib Selama Puasa",
    body: "Mekanisme puasa: penurunan insulin → ginjal membuang natrium → air dan kalium ikut tersapu (diuresis natriuretik). Defisiensi ini menyebabkan: nyeri kepala berdenyut, spasme otot, letargi absolut. PROTOKOL: campurkan 1/4–1/2 sdt garam laut murni ke dalam botol air mineral. Target: 3–4 liter cairan total selama 36 jam. ⛔ DILARANG puasa kering.",
    source: "1.pdf",
    tag: "WARNING",
  },
  {
    id: "fast-005",
    category: "fasting",
    severity: "warning",
    title: "⚠️ Frekuensi Maksimum Puasa 36 Jam",
    body: "Frekuensi disarankan tetap pada 2–3 kali per bulan. Jika dilakukan terlalu sering tanpa refeeding gizi mikro memadai → laju BMR dapat tertekan atau memicu hilangnya massa otot (lean body mass). ⛔ Latihan resistensi hipertrofi DILARANG pada jam ke-24 puasa (fase ketosis aktif).",
    source: "1.pdf",
    tag: "WARNING",
  },

  // ============================================================
  // SUPPLEMENT WARNINGS — Termasuk CONFLICT dengan jadwal_harian.txt
  // ============================================================
  {
    id: "supp-001",
    category: "supplement",
    severity: "warning",
    title: "⚠️ Interaksi Zinc-Magnesium-Kalsium (Kompetisi DMT1)",
    body: "Zinc (15mg) + Kalsium (100mg) dari Hemaviton dapat mengganggu penyerapan Magnesium jika dikonsumsi terlalu berdekatan. Karena itu jadwal saat ini menempatkan Hemaviton Dosis 2 maksimal pukul 13:00 dan Magnesium Glycinate pukul 21:00–21:30 agar jarak minimal 8 jam tetap terjaga.",
    source: "1.pdf",
    tag: "WARNING",
  },
  {
    id: "supp-002",
    category: "supplement",
    severity: "warning",
    title: "⚠️ Hemaviton — Kafein & Ginseng: Batas Konsumsi Siang",
    body: "Guaranine (setara kafein) dan Ginseng dalam Hemaviton bersifat stimulan neuroendokrin. Karena itu dosis siang dijadwalkan pada 12:00–13:00 dan wajib selesai maksimal pukul 13:00 setelah makan siang berlemak.",
    source: "1.pdf",
    tag: "WARNING",
  },
  {
    id: "supp-004",
    category: "supplement",
    severity: "info",
    title: "ℹ️ Vitamin D3 — Pindah ke Siang, Tetap Valid",
    body: "Jadwal saat ini menempatkan D3 pada 12:00–13:00 bersama makan siang berlemak dan Om3heart. Ini tetap valid karena D3 (cholecalciferol) bersifat lipofilik dan penyerapannya terbantu media lemak.",
    source: "1.pdf",
    tag: "WARNING",
  },
  {
    id: "supp-005",
    category: "supplement",
    severity: "danger",
    title: "⚠️ Hepatotoksisitas — Pantau Penggunaan Jangka Panjang",
    body: "Dengan 2 kapsul Hemaviton per hari (mengandung Ginseng yang dimetabolisme sitokrom P450 di hati) dan akumulasi vitamin larut lemak (D3), pemantauan berkala fungsi hati direkomendasikan untuk penggunaan jangka panjang (>3 bulan). Jangan tambahkan suplemen lain sembarangan. Hindari NSAID harian tanpa pengawasan dokter.",
    source: "1.pdf",
    tag: "DANGER",
  },
  {
    id: "supp-006",
    category: "supplement",
    severity: "info",
    title: "ℹ️ Creatine (Sore, 16:00–17:00) — Aman Termasuk Saat Puasa",
    body: "Creatine Monohydrate murni tidak memicu reseptor insulin, bebas kalori → aman dikonsumsi sore hari maupun saat puasa 36 jam tanpa membatalkan ketosis atau merusak autophagy. Larutkan dalam 400–500 ml air putih.",
    source: "1.pdf",
    tag: "WARNING",
  },

  // ============================================================
  // EXERCISE WARNINGS (dari 1.pdf, Bab 3)
  // ============================================================
  {
    id: "exer-001",
    category: "exercise",
    severity: "danger",
    title: "⛔ DILARANG: Latihan Resistensi Saat Puasa >24 Jam",
    body: "Glikogen hepatik dan otot berada pada tingkat terendah setelah puasa >24 jam. Melakukan latihan resistensi hipertrofik atau lompat tali intensitas tinggi pada fase ini sangat kontraproduktif → memicu glukoneogenesis (pemecahan protein otot menjadi glukosa) dan meningkatkan risiko hipoglikemia ortostatik. Hari puasa harus diselaraskan dengan hari istirahat atau sebatas mobilitas ringan.",
    source: "1.pdf",
    tag: "DANGER",
  },
  {
    id: "exer-002",
    category: "exercise",
    severity: "danger",
    title: "⛔ Bahaya Rhabdomyolysis & Dehidrasi",
    body: "Progressive Overload yang berlebihan — apalagi dengan Creatine yang memperbesar volume sel otot — mengharuskan aliran darah membersihkan sisa metabolik berat. Berolahraga di bawah defisit hidrasi absolut atau defisit tidur kronis dapat merobek serat mioglobin yang menyumbat filtrasi ginjal. WAJIB: minimum 3 liter cairan per hari.",
    source: "1.pdf",
    tag: "DANGER",
  },
  {
    id: "exer-003",
    category: "exercise",
    severity: "info",
    title: "ℹ️ Prinsip RPE & RIR — Panduan Intensitas",
    body: "Gunakan skala RPE 1–10. Sebagian besar set harus diakhiri pada RPE 7–8 (menyisakan 2–3 repetisi sebelum kegagalan / RIR 2–3). Pemaksaan setiap set hingga titik gagal absolut dapat menghambat rekrutmen unit motorik pada hari latihan berikutnya dan menyebabkan CNS fatigue. Pemanasan dinamis dan pendinginan statis adalah regulasi keamanan yang tidak dapat dinegosiasikan.",
    source: "1.pdf",
    tag: "WARNING",
  },
  {
    id: "exer-004",
    category: "exercise",
    severity: "info",
    title: "ℹ️ Progresi Terbatas — Metode Alternatif",
    body: "Karena beban dumbbell statis di rumah, gunakan metode progresi sekunder: (1) Perlambat fase eksentrik 3–4 detik, (2) Kurangi waktu istirahat antar set, (3) Tingkatkan total repetisi dalam koridor target. Progressive overload tidak harus selalu menambah berat beban.",
    source: "1.pdf",
    tag: "WARNING",
  },

  // ============================================================
  // SKINCARE WARNINGS (dari 2.pdf)
  // ============================================================
  {
    id: "skin-001",
    category: "skincare",
    severity: "danger",
    title: "⛔ PELANGGARAN ABSOLUT: AHA BHA PHA Toner + Clay Mask BHA Malam yang Sama",
    body: "Menggabungkan Exfoliating Toner (AHA/BHA/PHA) dengan Salicylic Acid Clay Mask Stick di malam yang sama menginduksi keracunan asam lokal yang membakar sawar epidermis. Ini adalah kontraindikasi absolut dalam protokol Skin Cycling. Selalu pisahkan: Toner di Hari 1 & 5, BHA Clay Mask di Hari 3.",
    source: "2.pdf",
    tag: "DANGER",
  },
  {
    id: "skin-002",
    category: "skincare",
    severity: "danger",
    title: "⛔ Marina Body Lotion DILARANG untuk Wajah",
    body: "Densitas viskositas tinggi, Stearic Acid, dan Titanium Dioxide makro dalam Marina Hand Body Lotion dirancang khusus untuk kulit tubuh yang tebal. Sediaan ini sangat komedogenik bagi struktur folikel wajah yang halus. Aplikasikan HANYA dari garis rahang ke bawah.",
    source: "2.pdf",
    tag: "DANGER",
  },
  {
    id: "skin-003",
    category: "skincare",
    severity: "warning",
    title: "⚠️ Wajib Patch Test — Sebelum Mulai Hari 1",
    body: "Oleskan setetes G2G AHA BHA PHA Exfoliating Toner DAN G2G 10% Niacinamide Serum di kulit leher lateral atau bagian dalam siku selama 24 jam penuh. Absennya respons gatal, pembengkakan merah, atau sensasi nyeri melegitimasi penggunaan aman pada wajah. JANGAN lewatkan langkah ini terutama jika ada riwayat atopi atau dermatitis kontak.",
    source: "2.pdf",
    tag: "WARNING",
  },
  {
    id: "skin-004",
    category: "skincare",
    severity: "warning",
    title: "⚠️ Serum Niacinamide 10% — Peringatan Konsentrasi",
    body: "Konsentrasi 10% melebihi batas konservatif 5% yang direkomendasikan jurnal. Dapat menyebabkan eritema transien (kemerahan), sensasi menyengat (mild tingling), dan pruritus ringan di beberapa menit pertama. Jika reaksi berlebihan: turunkan frekuensi ke 1x sehari (PM) atau campurkan langsung dengan pelembap Ceramide untuk mendilusi.",
    source: "2.pdf",
    tag: "WARNING",
  },
  {
    id: "skin-005",
    category: "skincare",
    severity: "warning",
    title: "⚠️ Sinyal Compromised Skin Barrier — Aktifkan Washout",
    body: "TANDA DEFINITIF: Kulit tiba-tiba merah dan terasa 'cekit-cekit' / sensasi terbakar saat dioleskan pelembap biasa sekalipun. TINDAKAN DARURAT: Hentikan semua AHA/BHA Toner, Serum 10%, dan Clay Mask selama 5–7 hari berturut-turut. Jalankan Washout Routine: Makarizo Facial Wash (malam saja) → Blueberry Ceramide → Azarine SPF45 (pagi). Jangan abaikan sinyal ini.",
    source: "2.pdf",
    tag: "DANGER",
  },
  {
    id: "skin-006",
    category: "skincare",
    severity: "warning",
    title: "⚠️ Re-aplikasi Sunscreen Wajib Setiap 2 Jam",
    body: "Tabir surya Azarine Hydrasoothe Gel sangat ringan dan tidak resisten terhadap keringat tropis berat. Re-aplikasi WAJIB setiap 2–3 jam pada paparan sinar UV tinggi. Mengabaikan ini menggagalkan seluruh intervensi bahan aktif malam hari dan meningkatkan risiko inflamasi jika kulit sudah ditipiskan oleh agen eksfoliasi. Cara: usap keringat dengan tisu kering (bukan tisu basah beralkohol), oleskan ulang merata.",
    source: "2.pdf",
    tag: "WARNING",
  },
  {
    id: "skin-007",
    category: "skincare",
    severity: "info",
    title: "ℹ️ Clay Mask — Jangan Biarkan Retak Keras",
    body: "JANGAN membiarkan clay mask (Pomegranate Clay Stick maupun Volcano BHA Clay Stick) mengering hingga retak keras di wajah. Hal ini menciptakan perbedaan osmotik yang akan menarik molekul air keluar dari stratum corneum → dehidrasi sekunder. Diamkan TEPAT 10–15 menit lalu bilas dengan emulsi air.",
    source: "2.pdf",
    tag: "WARNING",
  },
  {
    id: "skin-008",
    category: "skincare",
    severity: "info",
    title: "ℹ️ Makarizo Facial Wash — Mengandung Fragrans & Menthol",
    body: "Sediaan pembersih ini mengandung parfum/fragrans dan Menthol. Pada individu dengan dermatitis kontak atau rosacea, komponen ini dapat memicu eritema transien. Direkomendasikan melakukan patch test pada kulit area rahang bawah jika memiliki riwayat atopi sebelum penggunaan rutin.",
    source: "2.pdf",
    tag: "WARNING",
  },
  {
    id: "skin-009",
    category: "skincare",
    severity: "info",
    title: "ℹ️ Micellar Water — Hindari Friksi Mekanis",
    body: "Penggunaan kapas kasar atau gosokan yang terlalu kuat saat menggunakan Micellar Water secara fisik akan mengeksfoliasi stratum corneum secara paksa (mikro-abrasi), memicu iritasi. Usapkan kapas secara PERLAHAN dan SEARAH (gentle swipe). Gunakan kapas berkualitas medis.",
    source: "2.pdf",
    tag: "WARNING",
  },
  {
    id: "skin-010",
    category: "skincare",
    severity: "info",
    title: "UNKNOWN: Komposisi Lengkap Makarizo Facial Wash",
    body: "Kandungan minor spesifik Makarizo Barber Daily Bright Radiace Facial Wash tidak dapat diverifikasi silang 100% dari basis data ilmiah. Status: UNKNOWN komposisi lengkap. Rekomendasi penggunaan diselaraskan dengan tata laksana best-practice untuk kategori pembersih ber-pH rendah.",
    source: "2.pdf",
    tag: "UNKNOWN",
  },
  {
    id: "skin-011",
    category: "skincare",
    severity: "info",
    title: "UNKNOWN: Komposisi Lengkap Marina Hand Body Lotion",
    body: "Kandungan minor spesifik Marina UV White Hand And Body Lotion tidak dapat diverifikasi silang 100% dari basis data ilmiah. Status: UNKNOWN komposisi lengkap. Rekomendasi best-practice diterapkan berdasarkan matriks losion badan komersial.",
    source: "2.pdf",
    tag: "UNKNOWN",
  },
];

export const getSafetyByCategory = (
  category: SafetyNote["category"]
): SafetyNote[] =>
  SAFETY_NOTES.filter((note) => note.category === category);

export const getSafetyByTag = (tag: SafetyNote["tag"]): SafetyNote[] =>
  SAFETY_NOTES.filter((note) => note.tag === tag);
