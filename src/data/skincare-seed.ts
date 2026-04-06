// ============================================================
// SKINCARE SEED DATA — arunav2
// Jadwal final diselaraskan dengan jadwal lengkap fix.txt
// ============================================================

import type { DayIndex, SkincareDay, SkincareStep } from "@/types";
import {
  FINAL_SKINCARE_AM_STEPS,
  FINAL_SKINCARE_PM_BY_DAY,
} from "@/data/final-schedule";

const NAMA_HARI: Record<DayIndex, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

function buatStep(product: string, order: number): SkincareStep {
  if (product === "Multi-Masking") {
    return {
      order,
      product,
      productShort: product,
      notes:
        "Glad2Glow Volcano Clay Stick pada area berminyak dan Pomegranate Brightening Clay Stick pada area lain.",
      warningNote:
        "Jangan digabung dengan Daily Exfoliating Toner di malam yang sama dan jangan dibiarkan mengering terlalu lama.",
    };
  }

  if (product === "Daily Exfoliating Toner") {
    return {
      order,
      product,
      productShort: product,
      notes: "Gunakan setelah Facial Wash pada kulit kering.",
      warningNote: "Batasi sesuai jadwal Rabu dan Minggu.",
    };
  }

  return {
    order,
    product,
    productShort: product,
  };
}

export function getSkincarePlanForDay(dayIndex: DayIndex): SkincareDay {
  const pmRoutine = FINAL_SKINCARE_PM_BY_DAY[dayIndex].map((produk, index) =>
    buatStep(produk, index + 1),
  );

  const malamMasker = dayIndex === 2 || dayIndex === 5;
  const malamEksfoliasi = dayIndex === 3 || dayIndex === 7;

  return {
    dayIndex,
    dayName: NAMA_HARI[dayIndex],
    phase: malamMasker || malamEksfoliasi ? "pencerahan" : "stabilitas",
    amLabel: "Rutin Pagi (Setiap Hari)",
    pmLabel: malamMasker
      ? "Malam Masker"
      : malamEksfoliasi
        ? "Malam Eksfoliasi"
        : "Malam Normal",
    isRecoveryDay: false,
    amRoutine: FINAL_SKINCARE_AM_STEPS.map((produk, index) => buatStep(produk, index + 1)),
    pmRoutine,
    warnings: malamMasker
      ? [
          "Multi-Masking hanya Selasa dan Jumat.",
          "Jangan digabung dengan Daily Exfoliating Toner di malam yang sama.",
        ]
      : malamEksfoliasi
        ? [
            "Eksfoliasi hanya Rabu dan Minggu.",
            "Pagi berikutnya wajib sunscreen.",
          ]
        : [],
  };
}

export const SKINCARE_SCHEDULE: SkincareDay[] = ([1, 2, 3, 4, 5, 6, 7] as DayIndex[]).map(
  getSkincarePlanForDay,
);

export const SKINCARE_RULES = {
  sunscreenReapply: {
    title: "Mandat Re-aplikasi Sunscreen",
    rule: "Wajib re-aplikasi sunscreen setiap 2 jam selama di luar ruangan.",
    howTo: "Usap keringat, lalu oleskan ulang secara merata.",
    why: "Paparan UV dan keringat menurunkan proteksi lapisan sunscreen.",
  },
  multiMaskingRule: {
    title: "Aturan Multi-Masking",
    rules: [
      "Volcano Clay Stick untuk area berminyak.",
      "Pomegranate Brightening Clay Stick untuk area lain.",
      "Gunakan bersamaan 10–15 menit lalu bilas tuntas.",
    ],
  },
  overExfoliationSignal: {
    title: "Sinyal Over-Exfoliation",
    symptoms: ["Perih", "merah", "kulit terasa terbakar"],
    action: "Hentikan eksfoliasi sementara.",
    washoutRoutine: "Facial Wash → Blueberry Ceramide Moisturizer → Sunscreen pagi.",
  },
};
