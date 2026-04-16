// ============================================================
// MARKDOWN FORMATTER — arunav2 → Obsidian
// Konversi data Firebase/localStorage ke format Markdown
// ============================================================

import type { CompletionLog } from "@/types";
import { parseLocalDateKey } from "@/lib/date";
import { getDayIndexFromDateKey, getDayTypeLabel } from "@/lib/utils";
import {
  getExercisePlanForDate,
  getMealPlanForDate,
  getSupplementScheduleForDate,
  getFastingContext,
} from "@/lib/fasting";
import { getSkincarePlanForDay } from "@/data/skincare-seed";
import type { UserPreferences } from "@/types";

export interface ObsidianDailyNote {
  filePath: string; // obsidian-vault/daily/2026-04-16 Pull Day.md
  content: string;
  dateKey: string;
}

export interface ObsidianDashboard {
  filePath: string;
  content: string;
}

// ── Helpers ────────────────────────────────────────────────

function formatDateId(dateKey: string): string {
  const d = parseLocalDateKey(dateKey);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseCategoryFromId(taskId: string) {
  // ${dateKey}_ex_main | _ex_0 | _meal_0 | _supp_0 | _skin_am | _skin_pm_0 | _hydration | _fasting
  const parts = taskId.split("_");
  if (parts.includes("ex")) return "exercise";
  if (parts.includes("meal")) return "nutrition";
  if (parts.includes("supp")) return "supplement";
  if (parts.includes("skin")) return "skincare";
  if (parts.includes("hydration")) return "hydration";
  if (parts.includes("fasting")) return "fasting";
  return "other";
}

// ── Daily Note Generator ───────────────────────────────────

export function generateDailyNote(
  log: CompletionLog,
  prefs: UserPreferences,
): ObsidianDailyNote {
  const { dateKey } = log;
  const dayIndex = getDayIndexFromDateKey(dateKey);
  const exercise = getExercisePlanForDate(dayIndex, dateKey, prefs);
  const mealPlan = getMealPlanForDate(dayIndex, dateKey, prefs);
  const suppSched = getSupplementScheduleForDate(dayIndex, dateKey, prefs);
  const skincare = getSkincarePlanForDay(dayIndex);
  const fastCtx = getFastingContext(dateKey, prefs);
  const dayLabel = getDayTypeLabel(exercise.type);

  const completed = new Set(log.completedTaskIds);
  const totalTasks = log.completedTaskIds.length + log.skippedTaskIds.length; // approximate

  // ── Count by category ─────────────────────────────────
  const doneByCategory: Record<string, string[]> = {};
  for (const id of log.completedTaskIds) {
    const cat = parseCategoryFromId(id);
    if (!doneByCategory[cat]) doneByCategory[cat] = [];
    doneByCategory[cat].push(id);
  }

  // ── Tags ──────────────────────────────────────────────
  const tags: string[] = ["#health", "#arunav2"];
  if (doneByCategory["exercise"]?.length) tags.push("#gym");
  if (doneByCategory["nutrition"]?.length) tags.push("#nutrition");
  if (doneByCategory["skincare"]?.length) tags.push("#skincare");
  if (fastCtx.isFastingDay) tags.push("#puasa");
  if (fastCtx.isRefeedDay) tags.push("#refeed");

  // ── Exercise section ──────────────────────────────────
  let exerciseSection = "";
  if (exercise.exercises.length > 0) {
    exerciseSection = `\n## 🏋️ Latihan — ${exercise.label}\n\n`;
    exerciseSection += `> Durasi: ${exercise.duration}\n\n`;
    for (const ex of exercise.exercises) {
      const id = `${dateKey}_ex_${exercise.exercises.indexOf(ex)}`;
      const check = completed.has(id) ? "x" : " ";
      const meta = [
        ex.sets ? `${ex.sets} set` : "",
        ex.reps ? `× ${ex.reps}` : "",
        ex.rpe ? `RPE ${ex.rpe}` : "",
        ex.rest ? `rest ${ex.rest}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      exerciseSection += `- [${check}] **${ex.name}** ${meta ? `— ${meta}` : ""}\n`;
    }
    if (exercise.warmup) exerciseSection += `\n> Warmup: ${exercise.warmup}\n`;
    if (exercise.cooldown)
      exerciseSection += `> Cooldown: ${exercise.cooldown}\n`;
  }

  // ── Nutrition section ────────────────────────────────
  let nutritionSection = "";
  if (fastCtx.isStrictFastDay) {
    nutritionSection = `\n## 🍽️ Nutrisi — Puasa Aktif\n\n> Tidak ada asupan kalori hari ini.\n`;
  } else {
    nutritionSection = `\n## 🍽️ Nutrisi\n\n`;
    mealPlan.meals.forEach((meal, i) => {
      const id = `${dateKey}_meal_${i}`;
      const check = completed.has(id) ? "x" : " ";
      nutritionSection += `### ${meal.label} (${meal.time})\n`;
      nutritionSection += `- [${check}] **${meal.label}** selesai\n`;
      for (const item of meal.items) {
        nutritionSection += `  - ${item}\n`;
      }
      if (meal.kcal)
        nutritionSection += `  - 📊 ${meal.kcal} kkal · ${meal.protein}g protein\n`;
      nutritionSection += "\n";
    });
  }

  // ── Supplement section ───────────────────────────────
  let suppSection = `\n## 💊 Suplemen\n\n`;
  if (fastCtx.isStrictFastDay) {
    suppSection += "> Suplemen berkalori ditunda ke refeeding besok.\n";
  } else {
    suppSched.supplements.forEach((supp, i) => {
      const id = `${dateKey}_supp_${i}`;
      const check = completed.has(id) ? "x" : " ";
      suppSection += `- [${check}] **${supp.name}** ${supp.dose} — ${supp.timeRange}\n`;
    });
  }

  // ── Skincare section ─────────────────────────────────
  let skincareSection = `\n## 🧴 Skincare — ${skincare.dayName} (${skincare.pmLabel})\n\n`;
  const skinAmId = `${dateKey}_skin_am`;
  const skinAmCheck = completed.has(skinAmId) ? "x" : " ";
  skincareSection += `- [${skinAmCheck}] **Pagi** — ${skincare.amRoutine.map((s) => s.productShort).join(" → ")}\n`;
  skincare.pmRoutine.forEach((step, i) => {
    const id = `${dateKey}_skin_pm_${i}`;
    const check = completed.has(id) ? "x" : " ";
    skincareSection += `- [${check}] **Malam** — ${step.productShort}${step.notes ? ` _(${step.notes})_` : ""}\n`;
  });

  // ── Hydration ────────────────────────────────────────
  const hydrationId = `${dateKey}_hydration`;
  const hydrationCheck = completed.has(hydrationId) ? "x" : " ";
  const hydrationTarget = fastCtx.isFastingDay ? "3–4 Liter" : "2–3 Liter";
  const hydrationSection = `\n## 💧 Hidrasi\n\n- [${hydrationCheck}] Target ${hydrationTarget}\n`;

  // ── Fasting section ──────────────────────────────────
  let fastingSection = "";
  if (fastCtx.isFastStartDay) {
    fastingSection = `\n## ⏳ Puasa\n\n> Puasa dimulai 20:00 malam ini. Makan terakhir sebelum pukul 20:00.\n`;
  } else if (fastCtx.isRefeedDay) {
    fastingSection = `\n## ⏳ Refeeding\n\n> Puasa selesai. Refeeding bertahap mulai 08:00.\n`;
    const fastingId = `${dateKey}_fasting`;
    const fastingCheck = completed.has(fastingId) ? "x" : " ";
    fastingSection += `- [${fastingCheck}] Refeeding selesai\n`;
  } else if (fastCtx.isStrictFastDay) {
    fastingSection = `\n## ⏳ Puasa Aktif\n\n> ${fastCtx.hourElapsed}j / 36j — ${fastCtx.percentComplete}% selesai\n`;
    fastingSection += `> Elektrolit + air 3–4L. Tidak ada latihan resistensi.\n`;
  }

  // ── Notes ────────────────────────────────────────────
  let notesSection = "";
  if (log.notes?.trim()) {
    notesSection = `\n## 📝 Catatan\n\n${log.notes.trim()}\n`;
  }
  if (log.skinReaction && log.skinReaction !== "none") {
    const reactionLabel =
      log.skinReaction === "mild" ? "Ringan ⚠️" : "Parah 🔴";
    notesSection += `\n> **Reaksi Kulit:** ${reactionLabel}\n`;
  }

  // ── Summary ──────────────────────────────────────────
  const completedCount = log.completedTaskIds.length;
  const summarySection =
    `\n## 📊 Summary\n\n| Kategori | Selesai |\n|---|---|\n` +
    `| Latihan | ${doneByCategory["exercise"]?.length ?? 0} task |\n` +
    `| Nutrisi | ${doneByCategory["nutrition"]?.length ?? 0} meal |\n` +
    `| Suplemen | ${doneByCategory["supplement"]?.length ?? 0} item |\n` +
    `| Skincare | ${doneByCategory["skincare"]?.length ?? 0} langkah |\n` +
    `| Total | **${completedCount} task** |\n`;

  // ── Assemble ─────────────────────────────────────────
  const content = [
    `---`,
    `date: ${dateKey}`,
    `day: ${dayLabel}`,
    `tags: ${tags.join(" ")}`,
    `completed: ${completedCount}`,
    `updated: ${new Date(log.lastUpdated).toISOString()}`,
    `---`,
    ``,
    `# ${dateKey} — ${dayLabel}`,
    ``,
    `${formatDateId(dateKey)}`,
    exerciseSection,
    nutritionSection,
    suppSection,
    skincareSection,
    hydrationSection,
    fastingSection,
    notesSection,
    summarySection,
    ``,
    `---`,
    `_Disinkronkan dari arunav2 pada ${new Date().toLocaleString("id-ID")}_`,
  ].join("\n");

  const fileName = `${dateKey} ${dayLabel}.md`;

  return {
    filePath: `My Life/daily/${fileName}`,
    content,
    dateKey,
  };
}

// ── Progress Dashboard Generator ──────────────────────────

export interface ProgressData {
  streak: number;
  last7: Array<{ dateKey: string; completedCount: number; percent: number }>;
  last30: Array<{ dateKey: string; completedCount: number; percent: number }>;
  totalCompletedTasks: number;
  perfectDays: number;
  avg7: number;
  avg30: number;
  startDate: string;
}

export function generateProgressDashboard(
  data: ProgressData,
): ObsidianDashboard {
  const now = new Date().toLocaleString("id-ID");
  const avg7 = data.avg7;
  const avg30 = data.avg30;
  const streak = data.streak;
  const perfect = data.perfectDays;

  // Heatmap cells (last 30)
  const heatmapRows: string[][] = [];
  const cells = data.last30.map((p) => {
    const pct = p.percent;
    let fill: string;
    if (pct === 0) fill = "░░";
    else if (pct < 30) fill = "▒░";
    else if (pct < 60) fill = "▒▒";
    else if (pct < 90) fill = "▓▒";
    else fill = "██";
    return `${fill}`;
  });

  // Build 7-day bar chart (text)
  const bars = data.last7.map((p) => {
    const bar =
      "█".repeat(Math.round(p.percent / 10)) +
      "░".repeat(10 - Math.round(p.percent / 10));
    return `| ${p.dateKey.slice(5)} | ${bar} | ${p.percent}% |`;
  });

  const content = [
    `---`,
    `updated: ${new Date().toISOString()}`,
    `tags: #dashboard #arunav2 #health`,
    `cssclass: arunav2-dashboard`,
    `---`,
    ``,
    `# 📊 arunav2 — Progress Dashboard`,
    ``,
    `> Terakhir diperbarui: ${now}`,
    ``,
    `## 🔥 Streak & Konsistensi`,
    ``,
    `| Metrik | Nilai |`,
    `|---|---|`,
    `| Streak Aktif | **${streak} hari** |`,
    `| Rata-rata 7 Hari | **${avg7}%** |`,
    `| Rata-rata 30 Hari | **${avg30}%** |`,
    `| Perfect Days | **${perfect} hari** |`,
    `| Total Task Selesai | **${data.totalCompletedTasks}** |`,
    `| Program Dimulai | ${data.startDate} |`,
    ``,
    `## 📈 7 Hari Terakhir`,
    ``,
    `| Tanggal | Progress | % |`,
    `|---|---|---|`,
    ...bars,
    ``,
    `## 🗓️ 30 Hari Terakhir (Heatmap)`,
    ``,
    `\`\`\``,
    chunkArray(cells, 6)
      .map((row) => row.join(" "))
      .join("\n"),
    `\`\`\``,
    ``,
    `> ░░ = 0% · ▒▒ = 30–60% · ██ = 90–100%`,
    ``,
    `## 📅 Ringkasan Mingguan`,
    ``,
    `| Hari | Tanggal | Status |`,
    `|---|---|---|`,
    ...data.last7.map((p) => {
      const emoji =
        p.percent >= 80
          ? "✅"
          : p.percent >= 50
            ? "⚠️"
            : p.percent > 0
              ? "🟡"
              : "❌";
      return `| ${p.dateKey} | ${p.percent}% | ${emoji} |`;
    }),
    ``,
    `---`,
    `_Auto-generated oleh arunav2 sync service_`,
  ].join("\n");

  return {
    filePath: "My Life/dashboard/progress.md",
    content,
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
