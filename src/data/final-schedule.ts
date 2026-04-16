import type { DayIndex } from "@/types";

export type FinalSupplementSlot = {
  waktu: "pagi" | "siang" | "sore" | "malam";
  rentangWaktu: string;
  nama: string;
  dosis: string;
  instruksi: string;
  tujuan: string;
  denganMakanan: boolean;
  peringatan?: string;
};

export const FINAL_SUPPLEMENT_SLOTS: FinalSupplementSlot[] = [
  {
    waktu: "pagi",
    rentangWaktu: "07:00–08:30",
    nama: "Hemaviton Stamina Plus",
    dosis: "1 Kapsul (Dosis 1)",
    instruksi: "15–30 menit setelah sarapan",
    tujuan: "Fokus mental dan energi awal untuk riset atau coding melalui stimulasi ATP.",
    denganMakanan: true,
  },
  {
    waktu: "siang",
    rentangWaktu: "12:00–13:00",
    nama: "Hemaviton Stamina Plus",
    dosis: "1 Kapsul (Dosis 2)",
    instruksi: "Segera setelah makan siang yang mengandung lemak; wajib selesai maksimal pukul 13:00.",
    tujuan: "Dorongan energi paruh kedua hari.",
    denganMakanan: true,
    peringatan: "Beri jarak minimal 8 jam sebelum Magnesium Glycinate malam.",
  },
  {
    waktu: "siang",
    rentangWaktu: "12:00–13:00",
    nama: "Om3heart",
    dosis: "2 Kapsul",
    instruksi: "Segera setelah makan siang yang mengandung lemak; wajib selesai maksimal pukul 13:00.",
    tujuan: "Mendukung penyerapan Vitamin D3 dan kebutuhan EPA/DHA.",
    denganMakanan: true,
  },
  {
    waktu: "siang",
    rentangWaktu: "12:00–13:00",
    nama: "MyWell Vitamin D3 1000 IU",
    dosis: "1 Tablet",
    instruksi: "Segera setelah makan siang yang mengandung lemak; wajib selesai maksimal pukul 13:00.",
    tujuan: "Penyerapan D3 maksimal menggunakan media lemak.",
    denganMakanan: true,
  },
  {
    waktu: "sore",
    rentangWaktu: "16:00–17:00",
    nama: "Creatine Monohydrate",
    dosis: "1 Sendok Takar (±5 gram)",
    instruksi: "Larutkan dalam 400–500 ml air putih.",
    tujuan: "Menjaga performa otot dan kognitif tanpa mengganggu penyerapan vitamin lainnya.",
    denganMakanan: false,
  },
  {
    waktu: "malam",
    rentangWaktu: "21:00–21:30",
    nama: "Alliwise Magnesium Glycinate",
    dosis: "2 Kapsul",
    instruksi: "Minimal 8 jam setelah dosis hemaviton siang.",
    tujuan: "Kualitas tidur, aktivasi Vitamin D3, dan menenangkan sistem saraf sebelum istirahat total.",
    denganMakanan: false,
    peringatan: "Pastikan transporter DMT1 sudah bersih dari Zinc/Kalsium.",
  },
];

export const FINAL_SKINCARE_AM_STEPS = [
  "Facial Wash",
  "Serum",
  "Pomegranate Brightening Moisturizer",
  "Sunscreen",
] as const;

export const FINAL_SKINCARE_PM_BY_DAY: Record<DayIndex, readonly string[]> = {
  1: ["Micellar Water", "Facial Wash", "Serum", "Blueberry Ceramide Moisturizer"],
  2: ["Micellar Water", "Facial Wash", "Multi-Masking", "Serum", "Blueberry Ceramide Moisturizer"],
  3: ["Micellar Water", "Facial Wash", "Daily Exfoliating Toner", "Serum", "Blueberry Ceramide Moisturizer"],
  4: ["Micellar Water", "Facial Wash", "Serum", "Blueberry Ceramide Moisturizer"],
  5: ["Micellar Water", "Facial Wash", "Multi-Masking", "Serum", "Blueberry Ceramide Moisturizer"],
  6: ["Micellar Water", "Facial Wash", "Serum", "Blueberry Ceramide Moisturizer"],
  7: ["Micellar Water", "Facial Wash", "Daily Exfoliating Toner", "Serum", "Blueberry Ceramide Moisturizer"],
} as const;
