// ============================================================
// FITNESS SEED DATA — arunav2
// Jadwal final diselaraskan dengan jadwal lengkap fix.txt
// ============================================================

import type {
  ExerciseDay,
  MealPlan,
  SupplementSchedule,
  FastingSchedule,
  NutritionTarget,
  DayIndex,
} from "@/types";
import { FINAL_SUPPLEMENT_SLOTS } from "@/data/final-schedule";

export type Supplement = {
  name: string;
  dose: string;
  timing: string;
  timingSlot: "pagi" | "siang" | "sore" | "malam";
  timeRange: string;
  withFood: boolean;
  notes: string;
  warningIfCombined?: string;
  conflictNote?: string;
};

export const NUTRITION_TARGET: NutritionTarget = {
  bmr: 1556.25,
  tdee: 2412,
  targetKcal: 1930,
  proteinGram: 135,
  fatGram: 60,
  carbsGram: 212,
  assumptions: [
    "ASSUMPTION: Usia ditetapkan 30 tahun (UNKNOWN di PDF)",
    "ASSUMPTION: Status normotensi (<120/80 mmHg)",
    "ASSUMPTION: Tidak ada GERD atau gastritis kronis",
    "ASSUMPTION: Fungsi ginjal dan hati normal",
    "ASSUMPTION: Tidur terkelola 7–8 jam per malam",
    "Formula: Mifflin-St Jeor | PAL 1.55 | Defisit 20%",
  ],
};

export const EXERCISE_SCHEDULE: ExerciseDay[] = [
  {
    dayIndex: 1, dayName: "Senin", type: "workout_lower",
    label: "Hipertrofi Kaki (Lower Body)", duration: "±50 Menit",
    warmup: "Pemanasan dinamis 5 menit", cooldown: "Pendinginan statis 5 menit",
    exercises: [
      { name: "Goblet Squat (Dumbbell vertikal)", sets: 4, reps: "10–12 Rep", rest: "90 detik", rpe: 8, rir: 2 },
      { name: "Romanian Deadlift (Bar Konektor)", sets: 4, reps: "8–10 Rep", rest: "90 detik", rpe: 8, rir: 2 },
      { name: "Dumbbell Reverse Lunge", sets: 3, reps: "10 Rep per kaki", rest: "60 detik", rpe: 7, rir: 3 },
      { name: "Standing Calf Raise (Dumbbell)", sets: 4, reps: "15–20 Rep", rest: "60 detik", rpe: 9, rir: 1 },
      { name: "Plank Hold", sets: 3, reps: "45–60 detik" },
    ],
    notes: "Menargetkan paha depan, rantai posterior (hamstring & glutes), dan stabilitas inti",
  },
  {
    dayIndex: 2, dayName: "Selasa", type: "workout_push",
    label: "Hipertrofi Dorongan (Push — Dada, Bahu, Trisep)", duration: "±45 Menit",
    warmup: "Rotasi bahu 5 menit",
    exercises: [
      { name: "Dumbbell Floor Press", sets: 4, reps: "10–12 Rep", rest: "90 detik", rpe: 8, rir: 2 },
      { name: "Overhead Press (Bar Konektor)", sets: 3, reps: "8–10 Rep", rest: "90 detik", rpe: 8, rir: 2 },
      { name: "Dumbbell Lateral Raise", sets: 4, reps: "12–15 Rep", rest: "60 detik", rpe: 8, rir: 2 },
      { name: "Lying Triceps Extension (Dumbbell)", sets: 3, reps: "10–12 Rep", rest: "60 detik", rpe: 8, rir: 2 },
      { name: "Deficit Push-up", sets: 3, reps: "Hingga RIR 1" },
    ],
    notes: "Menstimulasi hipertrofi pektoralis mayor, deltoid anterior/medial, dan trisep brakii",
  },
  {
    dayIndex: 3, dayName: "Rabu", type: "workout_hiit",
    label: "Kardio HIIT (Jump Rope)", duration: "±25 Menit",
    warmup: "Pemanasan ringan 5 menit", cooldown: "Pendinginan statis lambat 5 menit",
    exercises: [
      { name: "Regular Bounce", sets: 3, reps: "1 menit kerja / 30 detik istirahat" },
      { name: "Alternating High Knees", sets: 4, reps: "45 detik kerja / 30 detik istirahat" },
      { name: "Double Unders / Lompat Cepat", sets: 3, reps: "30 detik kerja / 30 detik istirahat" },
    ],
    notes: "Meningkatkan biogenesis mitokondria, VO2 Max, dan oksidasi lipid",
  },
  {
    dayIndex: 4, dayName: "Kamis", type: "workout_pull",
    label: "Hipertrofi Tarikan (Pull — Punggung & Bisep)", duration: "±50 Menit",
    warmup: "Pemanasan dinamis punggung 5 menit",
    exercises: [
      { name: "Bent-Over Row (Bar Konektor)", sets: 4, reps: "8–10 Rep", rest: "90 detik", rpe: 8, rir: 2 },
      { name: "Single-Arm Dumbbell Row", sets: 3, reps: "10–12 Rep per sisi", rest: "60 detik", rpe: 8, rir: 2 },
      { name: "Dumbbell Reverse Fly", sets: 3, reps: "12–15 Rep", rest: "60 detik", rpe: 8, rir: 2 },
      { name: "Bicep Curl (Bar Konektor / DB)", sets: 4, reps: "10–12 Rep", rest: "60 detik", rpe: 8, rir: 2 },
      { name: "Dumbbell Shrug", sets: 3, reps: "15 Rep" },
    ],
    notes: "Menargetkan latissimus dorsi, rhomboid, trapezius, dan bisep brakii",
  },
  {
    dayIndex: 5, dayName: "Jumat", type: "workout_fullbody",
    label: "Kondisioning Seluruh Tubuh (Full Body)", duration: "±40 Menit",
    warmup: "Pemanasan dinamis 5 menit",
    exercises: [
      { name: "Dumbbell Thrusters (Squat ke Press)", sets: 4, reps: "10 Rep", rest: "90 detik", rpe: 8 },
      { name: "Dumbbell Alternating Snatch", sets: 3, reps: "10 Rep per sisi", rest: "60 detik" },
      { name: "Dumbbell Step-Ups (ke kursi)", sets: 3, reps: "10 Rep per kaki" },
      { name: "Jump Rope Regular", sets: 1, reps: "3 menit non-stop" },
    ],
    notes: "Integrasi sistem energi aerobik dan anaerobik. Beban lebih ringan, eksekusi eksplosif",
  },
  {
    dayIndex: 6, dayName: "Sabtu", type: "active_recovery",
    label: "Pemulihan Aktif (Active Recovery)", duration: "30–40 Menit",
    exercises: [{ name: "Berjalan cepat / Bersepeda santai / Yoga ringan", notes: "Zona 2: 60–70% detak jantung maks" }],
    notes: "Sirkulasi darah intensitas rendah memfasilitasi pembersihan laktat",
  },
  {
    dayIndex: 7, dayName: "Minggu", type: "rest_fasting",
    label: "Istirahat Total + Persiapan Puasa 36 Jam", duration: "—",
    exercises: [],
    notes: "Istirahat total. Puasa dimulai 20:00 malam ini.",
  },
];

export const MEAL_PLANS: MealPlan[] = ([1, 2, 3, 4, 5, 6] as DayIndex[]).map((day) => ({
  dayIndex: day,
  isFastingDay: false,
  meals: [
    {
      time: "08:00", label: "Sarapan",
      items: ["Oatmeal instan ±50g (diseduh air panas)", "3 butir telur rebus", "1 cangkir kopi hitam / teh (tanpa gula)"],
      kcal: 380, protein: 22,
      notes: "Beta-glukan oat memperlambat pengosongan lambung",
    },
    {
      time: "13:00", label: "Makan Siang",
      items: ["Nasi putih SETENGAH porsi (~120g)", "1 potong ayam bakar dada", "1 potong tempe atau tahu", "Sayuran besar — KUAH DITIRISKAN"],
      kcal: 620, protein: 45,
      notes: "Sayur tanpa kuah atau ditiriskan maksimal",
    },
    {
      time: "19:00", label: "Makan Malam",
      items: ["Nasi putih SETENGAH porsi (~100g)", "1 potong ikan bakar ATAU ayam panggang", "Sayur bening (sop kubis/bayam)", "Air putih atau es teh tawar"],
      kcal: 480, protein: 35,
      notes: "Fase krusial: pemulihan miofibril selama tidur",
    },
    {
      time: "Fleksibel", label: "Kudapan (Opsional)",
      items: ["2 butir putih telur rebus ATAU 1 buah pisang"],
      kcal: 100, protein: 7,
      notes: "Kalium pisang membantu depuffing wajah",
    },
  ],
  totalKcal: 1580,
  totalProtein: 109,
}));

export const SUPPLEMENTS_BASE: Supplement[] = FINAL_SUPPLEMENT_SLOTS.map((slot) => ({
  name: slot.nama,
  dose: slot.dosis,
  timing: `${slot.rentangWaktu} — ${slot.instruksi}`,
  timingSlot: slot.waktu,
  timeRange: slot.rentangWaktu,
  withFood: slot.denganMakanan,
  notes: slot.tujuan,
  warningIfCombined: slot.peringatan,
}));

export const SUPPLEMENT_SCHEDULES: SupplementSchedule[] = ([1, 2, 3, 4, 5, 6, 7] as DayIndex[]).map((day) => ({
  dayIndex: day,
  isFastingDay: false,
  supplements: SUPPLEMENTS_BASE,
}));

export const FASTING_SCHEDULE: FastingSchedule = {
  startDay: 7, startTime: "20:00",
  endDay: 2, endTime: "08:00",
  totalHours: 36,
  phases: [
    { hourRange: "0 jam", dayTime: "Minggu, 20:00", title: "Inisiasi Puasa", description: "Tidak ada kalori masuk setelah titik ini.", actions: ["Konsumsi makan malam terakhir (sarat protein dan serat)", "Mulai hitung waktu puasa dari 20:00", "Siapkan air mineral"], isRestricted: false },
    { hourRange: "12–16 jam", dayTime: "Senin, 08:00–12:00", title: "Transisi Glikogenolitik", description: "Cadangan glukosa hati menipis drastis. Ghrelin melonjak.", actions: ["Konsumsi 1–2 cangkir kopi hitam tanpa gula / teh hijau bila perlu", "Tetap aktif ringan (jalan santai)", "Minum air mineral konsisten"], isRestricted: false },
    { hourRange: "24 jam", dayTime: "Senin, 20:00", title: "Puncak Ketogenesis & Autophagy", description: "Tubuh murni bergantung pada oksidasi lipid. Deplesi mineral aktif.", actions: ["⚠️ Suplementasi elektrolit: 1/4–1/2 sdt garam laut dalam air mineral", "Target air: 3–4 liter total", "⛔ Latihan resistensi MUTLAK DILARANG"], isRestricted: true },
    { hourRange: "30–36 jam", dayTime: "Selasa, 02:00–08:00", title: "Regenerasi Selular Maksimal", description: "Autofagi optimal selama tidur. HGH meningkat untuk melindungi massa otot.", actions: ["Prioritaskan tidur berkualitas", "Persiapkan refeeding untuk 08:00"], isRestricted: false },
  ],
  refeeding: [
    { time: "Selasa 08:00", items: ["Kaldu tulang (bone broth) — IDEAL", "ATAU: 1–2 putih telur rebus (tanpa saus)"], notes: "⛔ DILARANG makanan gorengan/karbohidrat besar sebagai makanan pertama." },
    { time: "Selasa 09:00", items: ["Oatmeal + telur rebus", "Suplemen pagi dan siang dapat dikonsumsi bersama refeeding ini"], notes: "Tunggu 30–60 menit setelah makanan pertama sebelum makan substansial" },
  ],
  electrolyteProtocol: ["Target: 3–4 liter air selama 36 jam", "Campurkan 1/4–1/2 sdt garam laut ke dalam botol air mineral", "⚠️ DILARANG puasa kering"],
  redFlags: [
    "🔴 Palpitasi jantung berdebar tidak beratur → Hentikan puasa SEKETIKA + air + sejumput gula",
    "🔴 Kelelahan visual / pandangan gelap → Hentikan puasa, berbaring, minum air",
    "🔴 Tremor atau disorientasi akut → Hentikan puasa SEKETIKA",
    "⛔ Frekuensi maks: 2–3 kali per bulan",
  ],
};

export const SATURDAY_CHEAT_MEAL_PROTOCOL = {
  title: "Protokol Mitigasi Makan Indulgensi Sabtu Malam",
  rules: ["🧂 Batasi bumbu mie instan maksimal setengah sachet", "🥚 Tambahkan 2 butir telur rebus + sayuran segar", "💧 Tingkatkan asupan air mineral 500–750 ml pasca konsumsi"],
};
