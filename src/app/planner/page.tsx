"use client";

import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { EXERCISE_SCHEDULE, FASTING_SCHEDULE, MEAL_PLANS, SUPPLEMENTS_BASE } from "@/data/fitness-seed";
import { SKINCARE_SCHEDULE } from "@/data/skincare-seed";
import { cn, getDayTypeBg, getDayTypeColor, getDayTypeIcon } from "@/lib/utils";
import type { DayIndex } from "@/types";

type PlannerTab = "olahraga" | "nutrisi" | "puasa" | "suplemen" | "skincare";

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<PlannerTab>("olahraga");
  const [selectedDay, setSelectedDay] = useState<DayIndex>(1);

  const TABS: { key: PlannerTab; label: string; icon: string }[] = [
    { key: "olahraga", label: "Olahraga", icon: "💪" },
    { key: "nutrisi", label: "Nutrisi", icon: "🍽️" },
    { key: "puasa", label: "Puasa 36j", icon: "⏳" },
    { key: "suplemen", label: "Suplemen", icon: "💊" },
    { key: "skincare", label: "Skincare", icon: "✨" },
  ];

  const selectedExercise = EXERCISE_SCHEDULE.find((e) => e.dayIndex === selectedDay);
  const selectedMeal = MEAL_PLANS.find((m) => m.dayIndex === selectedDay);
  const selectedSkincare = SKINCARE_SCHEDULE.find((s) => s.dayIndex === selectedDay);

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header title="Planner Mingguan" subtitle="Jadwal 7 hari dari PDF" />

      <div className="px-5 space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all border",
                activeTab === key
                  ? "bg-jade-800/70 text-jade-300 border-jade-700/60"
                  : "bg-night-800/60 text-gray-500 border-night-700/50"
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Day selector */}
        {activeTab !== "puasa" && activeTab !== "suplemen" && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {([1, 2, 3, 4, 5, 6, 7] as DayIndex[]).map((day) => {
              const ex = EXERCISE_SCHEDULE.find((e) => e.dayIndex === day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all min-w-[52px]",
                    selectedDay === day
                      ? getDayTypeBg(ex?.type ?? "rest_fasting") + " border-opacity-100"
                      : "bg-night-800/40 border-night-700/40"
                  )}
                >
                  <span className="text-base leading-none">
                    {getDayTypeIcon(ex?.type ?? "rest_fasting")}
                  </span>
                  <span className={cn(
                    "text-[10px] font-display font-semibold",
                    selectedDay === day ? getDayTypeColor(ex?.type ?? "rest_fasting") : "text-gray-600"
                  )}>
                    H{day}
                  </span>
                  <span className="text-[9px] text-gray-600">{DAY_NAMES[day - 1].slice(0, 3)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* === OLAHRAGA TAB === */}
        {activeTab === "olahraga" && selectedExercise && (
          <div className={cn("rounded-2xl border p-4", getDayTypeBg(selectedExercise.type))}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getDayTypeIcon(selectedExercise.type)}</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-display font-semibold tracking-wide">
                  {DAY_NAMES[selectedDay - 1]} — Hari {selectedDay}
                </p>
                <h2 className={cn("text-lg font-display font-bold", getDayTypeColor(selectedExercise.type))}>
                  {selectedExercise.label}
                </h2>
                <p className="text-xs text-gray-500">{selectedExercise.duration}</p>
              </div>
            </div>

            {selectedExercise.warmup && (
              <div className="mb-3 rounded-lg bg-night-900/60 p-2.5">
                <p className="text-xs text-gray-500">🔥 {selectedExercise.warmup}</p>
              </div>
            )}

            {selectedExercise.exercises.length > 0 ? (
              <div className="space-y-2">
                {selectedExercise.exercises.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-night-900/70 p-3">
                    <p className="text-sm font-medium text-gray-200">{ex.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {ex.sets && <span className="text-xs bg-jade-900/50 text-jade-400 px-2 py-0.5 rounded-full">{ex.sets} Set</span>}
                      {ex.reps && <span className="text-xs text-gray-400">{ex.reps}</span>}
                      {ex.rpe && <span className="text-xs bg-yellow-900/40 text-yellow-500 px-2 py-0.5 rounded-full">RPE {ex.rpe}</span>}
                      {ex.rir && <span className="text-xs text-gray-600">RIR {ex.rir}</span>}
                      {ex.rest && <span className="text-xs text-gray-600">Istirahat {ex.rest}</span>}
                    </div>
                    {ex.notes && <p className="mt-1 text-xs text-gray-600 leading-relaxed">{ex.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-night-900/50 p-4 text-center">
                <p className="text-sm text-gray-500">{selectedExercise.notes}</p>
              </div>
            )}

            {selectedExercise.cooldown && (
              <div className="mt-3 rounded-lg bg-night-900/60 p-2.5">
                <p className="text-xs text-gray-500">🧘 {selectedExercise.cooldown}</p>
              </div>
            )}

            {selectedExercise.notes && selectedExercise.exercises.length > 0 && (
              <div className="mt-3 rounded-lg bg-night-900/40 border border-night-700/30 p-2.5">
                <p className="text-xs text-gray-600 leading-relaxed">{selectedExercise.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* === NUTRISI TAB === */}
        {activeTab === "nutrisi" && selectedMeal && (
          <div className="space-y-3">
            {selectedDay === 7 && (
              <div className="rounded-xl bg-indigo-950/50 border border-indigo-800/50 p-3">
                <p className="text-sm font-display font-semibold text-indigo-300">⚠️ Malam Puasa Dimulai 20:00</p>
                <p className="text-xs text-indigo-400/80 mt-0.5">Makan malam ini adalah makan terakhir sebelum puasa 36 jam</p>
              </div>
            )}
            {selectedMeal.meals.map((meal, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-display font-bold text-gray-200">{meal.label}</span>
                    <span className="ml-2 text-xs text-gray-600">{meal.time}</span>
                  </div>
                </div>
                <ul className="space-y-1 mb-2">
                  {meal.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-jade-700 flex-shrink-0 mt-0.5">·</span>
                      <span className="text-xs text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
                {meal.notes && (
                  <p className="text-xs text-gray-600 italic border-t border-night-700/30 pt-2 mt-2 leading-relaxed">{meal.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === PUASA TAB === */}
        {activeTab === "puasa" && (
          <div className="space-y-4">
            {/* Schedule overview */}
            <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 p-4">
              <h2 className="font-display text-base font-bold text-indigo-200 mb-1">
                ⏳ Puasa 36 Jam (Monk Fast)
              </h2>
              <p className="text-sm text-indigo-400/80">
                Mulai: <strong>Minggu 20:00</strong> → Selesai: <strong>Selasa 08:00</strong>
              </p>
            </div>

            {/* Phases */}
            <div className="space-y-3">
              <p className="section-heading">Fase Puasa</p>
              {FASTING_SCHEDULE.phases.map((phase, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-600">{phase.dayTime}</p>
                      <h3 className="text-sm font-display font-bold text-gray-200">{phase.title}</h3>
                      <p className="text-xs text-indigo-400">{phase.hourRange}</p>
                    </div>
                    {phase.isRestricted && (
                      <span className="text-[10px] bg-red-900/50 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full font-display font-semibold flex-shrink-0">
                        LATIHAN DILARANG
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{phase.description}</p>
                  {phase.actions.length > 0 && (
                    <ul className="space-y-1">
                      {phase.actions.map((action, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 text-xs mt-0.5">▸</span>
                          <span className="text-xs text-indigo-400/80">{action}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Refeeding */}
            <div className="space-y-3">
              <p className="section-heading">Protokol Berbuka (Refeeding)</p>
              {FASTING_SCHEDULE.refeeding.map((step, i) => (
                <div key={i} className="card p-4">
                  <p className="text-xs font-display font-bold text-jade-400 mb-1.5">{step.time}</p>
                  <ul className="space-y-1 mb-2">
                    {step.items.map((item, j) => (
                      <li key={j} className="text-xs text-gray-400 flex items-start gap-1.5">
                        <span className="text-jade-700">·</span> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 italic">{step.notes}</p>
                </div>
              ))}
            </div>

            {/* Electrolyte protocol */}
            <div className="rounded-xl bg-blue-950/40 border border-blue-800/50 p-4">
              <p className="text-xs font-display font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                💧 Protokol Elektrolit
              </p>
              {FASTING_SCHEDULE.electrolyteProtocol.map((rule, i) => (
                <p key={i} className="text-xs text-blue-400/80 mb-1 leading-relaxed">{rule}</p>
              ))}
            </div>

            {/* Red Flags */}
            <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-4">
              <p className="text-xs font-display font-semibold text-red-400 mb-2 uppercase tracking-wide">
                🔴 Hentikan Puasa Jika...
              </p>
              {FASTING_SCHEDULE.redFlags.map((flag, i) => (
                <p key={i} className="text-xs text-red-400/80 mb-1.5 leading-relaxed">{flag}</p>
              ))}
            </div>
          </div>
        )}

        {/* === SUPLEMEN TAB === */}
        {activeTab === "suplemen" && (
          <div className="space-y-3">
            {/* Intro note */}
            <div className="card p-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                Jadwal 4 slot waktu — berlaku setiap hari. Pisahkan Hemaviton (siang) dengan Magnesium Glycinate (malam) minimal <strong className="text-yellow-400">8 jam</strong>.
              </p>
            </div>

            {/* Timeline visual */}
            {(["pagi", "siang", "sore", "malam"] as const).map((slot) => {
              const slotSupps = SUPPLEMENTS_BASE.filter((s) => s.timingSlot === slot);
              if (slotSupps.length === 0) return null;

              const SLOT_META = {
                pagi:  { icon: "🌅", label: "Pagi",  time: "07:00–08:30", color: "text-yellow-400", bg: "bg-yellow-950/30 border-yellow-800/40" },
                siang: { icon: "☀️", label: "Siang", time: "12:00–13:00", color: "text-orange-400", bg: "bg-orange-950/30 border-orange-800/40" },
                sore:  { icon: "🌤️", label: "Sore",  time: "16:00–17:00", color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-800/40" },
                malam: { icon: "🌙", label: "Malam", time: "21:00–21:30", color: "text-blue-400", bg: "bg-blue-950/30 border-blue-800/40" },
              };
              const meta = SLOT_META[slot];

              return (
                <div key={slot} className={cn("rounded-2xl border p-4", meta.bg)}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <p className={cn("text-sm font-display font-bold", meta.color)}>{meta.label}</p>
                      <p className="text-xs text-gray-600">{meta.time}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {slotSupps.map((supp, i) => (
                      <div key={i} className="rounded-xl bg-night-900/70 p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-200 flex-1">{supp.name}</p>
                          <span className="text-xs font-display font-bold text-jade-400 bg-jade-950/60 px-2 py-0.5 rounded-full flex-shrink-0">
                            {supp.dose}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{supp.notes}</p>
                        {supp.conflictNote && (
                          <div className="mt-2 rounded-lg bg-orange-950/40 border border-orange-800/40 p-2">
                            <p className="text-xs text-orange-400/80 leading-relaxed">{supp.conflictNote}</p>
                          </div>
                        )}
                        {supp.warningIfCombined && (
                          <div className="mt-1.5 rounded-lg bg-yellow-950/30 border border-yellow-800/30 p-2">
                            <p className="text-xs text-yellow-500/70 leading-relaxed">{supp.warningIfCombined}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Critical warning */}
            <div className="rounded-2xl bg-red-950/30 border border-red-800/50 p-4">
              <p className="text-xs font-display font-semibold text-red-400 mb-2">⚠️ Interaksi Kritis</p>
              <p className="text-xs text-red-400/70 leading-relaxed">Hemaviton Dosis 2 wajib selesai maksimal pukul 13:00, lalu Magnesium Glycinate dikonsumsi pukul 21:00–21:30 agar jarak minimal 8 jam tetap terjaga.</p>
            </div>
          </div>
        )}

        {/* === SKINCARE TAB === */}
        {activeTab === "skincare" && selectedSkincare && (
          <div className="space-y-4">
            {/* Phase badge */}
            <div className={cn(
              "rounded-xl p-3 border",
              selectedSkincare.isRecoveryDay
                ? "bg-teal-950/40 border-teal-800/50"
                : selectedSkincare.phase === "pencerahan"
                ? "bg-yellow-950/30 border-yellow-800/50"
                : "bg-night-800/40 border-night-700/50"
            )}>
              <p className={cn("text-sm font-display font-bold",
                selectedSkincare.isRecoveryDay ? "text-teal-300"
                : selectedSkincare.phase === "pencerahan" ? "text-yellow-300"
                : "text-gray-300"
              )}>
                {selectedSkincare.isRecoveryDay ? "🌿 Hari Pemulihan" : `Fase ${selectedSkincare.phase.charAt(0).toUpperCase() + selectedSkincare.phase.slice(1)}`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedSkincare.dayName} — Hari {selectedSkincare.dayIndex}</p>
            </div>

            {/* AM Routine */}
            <div>
              <p className="section-heading mb-2">☀️ Rutinitas Pagi — {selectedSkincare.amLabel}</p>
              <div className="space-y-2">
                {selectedSkincare.amRoutine.map((step) => (
                  <div key={step.order} className="card p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-display font-bold text-yellow-600 w-5 flex-shrink-0 mt-0.5">{step.order}.</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200">{step.productShort}</p>
                        {step.notes && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.notes}</p>}
                        {step.warningNote && <p className="text-xs text-yellow-500/70 mt-1 leading-relaxed">{step.warningNote}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PM Routine */}
            <div>
              <p className="section-heading mb-2">🌙 Rutinitas Malam — {selectedSkincare.pmLabel}</p>
              <div className="space-y-2">
                {selectedSkincare.pmRoutine.map((step) => (
                  <div key={step.order} className="card p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-display font-bold text-blue-600 w-5 flex-shrink-0 mt-0.5">{step.order}.</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200">{step.productShort}</p>
                        {step.notes && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.notes}</p>}
                        {step.warningNote && <p className="text-xs text-yellow-500/70 mt-1 leading-relaxed">{step.warningNote}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {selectedSkincare.warnings.length > 0 && (
              <div className="space-y-2">
                <p className="section-heading">Peringatan</p>
                {selectedSkincare.warnings.map((w, i) => (
                  <div key={i} className="rounded-xl bg-yellow-950/30 border border-yellow-800/40 p-3">
                    <p className="text-xs text-yellow-400/80 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
