"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { FASTING_SCHEDULE } from "@/data/fitness-seed";
import { getSkincarePlanForDay } from "@/data/skincare-seed";
import { getUserPreferences } from "@/lib/firebase";
import {
  getExercisePlanForDate,
  getFastingContext,
  getFastingCycleEventsForMonth,
  getMealPlanForDate,
  getSupplementScheduleForDate,
} from "@/lib/fasting";
import { addDays, getLocalDateKey, parseLocalDateKey } from "@/lib/date";
import { cn, getDayTypeLabel } from "@/lib/utils";
import type { DayIndex, UserPreferences } from "@/types";

type PlannerTab = "olahraga" | "nutrisi" | "puasa" | "suplemen" | "skincare";

function formatEventDateTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date);
}

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const SLOT_LABEL: Record<string, string> = { pagi: "Pagi", siang: "Siang", sore: "Sore", malam: "Malam" };
const SLOT_TIME: Record<string, string> = {
  pagi: "07:00–08:30", siang: "12:00–13:00", sore: "16:00–17:00", malam: "21:00–21:30",
};

const TABS: { key: PlannerTab; label: string }[] = [
  { key: "olahraga", label: "Olahraga" },
  { key: "nutrisi",  label: "Nutrisi" },
  { key: "puasa",    label: "Puasa 36j" },
  { key: "suplemen", label: "Suplemen" },
  { key: "skincare", label: "Skincare" },
];

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<PlannerTab>("olahraga");
  const [selectedDay, setSelectedDay] = useState<DayIndex>(() => {
    const weekday = new Date().getDay();
    return (weekday === 0 ? 7 : weekday) as DayIndex;
  });
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      try { setPrefs(await getUserPreferences()); }
      catch (e) { console.error("Failed to load planner prefs:", e); }
    };
    void loadPrefs();
  }, []);

  const weekStart = useMemo(() => {
    const today = new Date();
    return addDays(today, 1 - (today.getDay() || 7));
  }, []);

  const getWeekDateKey = (day: DayIndex) => getLocalDateKey(addDays(weekStart, day - 1));
  const selectedDateKey = getWeekDateKey(selectedDay);

  const selectedExercise = getExercisePlanForDate(selectedDay, selectedDateKey, prefs);
  const selectedMeal = getMealPlanForDate(selectedDay, selectedDateKey, prefs);
  const selectedSupplementSchedule = getSupplementScheduleForDate(selectedDay, selectedDateKey, prefs);
  const selectedSkincare = getSkincarePlanForDay(selectedDay);
  const selectedFastingContext = getFastingContext(selectedDateKey, prefs, parseLocalDateKey(selectedDateKey));
  const monthlyFastingEvents = getFastingCycleEventsForMonth(prefs, new Date());
  const todayFastingContext = getFastingContext(getLocalDateKey(), prefs, new Date());

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header title="Planner" subtitle="Jadwal mingguan" />

      <div className="px-5 space-y-4">

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn("tab-pill", activeTab === key && "active")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Day selector (not for puasa tab) */}
        {activeTab !== "puasa" && (
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {([1, 2, 3, 4, 5, 6, 7] as DayIndex[]).map((day) => {
              const dateKey = getWeekDateKey(day);
              const exercise = getExercisePlanForDate(day, dateKey, prefs);
              const dateLabel = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "2-digit" })
                .format(parseLocalDateKey(dateKey));
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[58px]"
                  style={{
                    background: isSelected ? "var(--bg-elevated)" : "transparent",
                    border: `1px solid ${isSelected ? "var(--text-muted)" : "var(--border)"}`,
                  }}
                >
                  <span className="text-sm leading-none">
                    {exercise.type === "active_recovery" || exercise.type === "rest_fasting" || exercise.type === "fasting_active" ? "◐" : "●"}
                  </span>
                  <span
                    className="text-[10px] font-display font-semibold"
                    style={{ color: isSelected ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {DAY_NAMES[day - 1].slice(0, 3)}
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{dateLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Olahraga ── */}
        {activeTab === "olahraga" && (
          <div className="card p-4">
            <div className="mb-4">
              <p className="section-label mb-1">{DAY_NAMES[selectedDay - 1]}</p>
              <h2 className="text-base font-display font-bold" style={{ color: "var(--text-primary)" }}>
                {selectedExercise.label}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{selectedExercise.duration}</p>
            </div>

            {selectedExercise.warmup && (
              <div className="mb-3 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Warmup: {selectedExercise.warmup}
                </p>
              </div>
            )}

            {selectedExercise.exercises.length > 0 ? (
              <div className="space-y-2">
                {selectedExercise.exercises.map((ex, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-elevated)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ex.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {ex.sets && (
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {ex.sets} set
                        </span>
                      )}
                      {ex.reps && (
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>× {ex.reps}</span>
                      )}
                      {ex.rpe && (
                        <span className="text-xs" style={{ color: "var(--warning)" }}>RPE {ex.rpe}</span>
                      )}
                      {ex.rir && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>RIR {ex.rir}</span>
                      )}
                      {ex.rest && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Rest {ex.rest}</span>
                      )}
                    </div>
                    {ex.notes && (
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{ex.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-secondary)" }}>
                {selectedExercise.notes}
              </p>
            )}

            {selectedExercise.cooldown && (
              <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                Cooldown: {selectedExercise.cooldown}
              </p>
            )}
          </div>
        )}

        {/* ── Nutrisi ── */}
        {activeTab === "nutrisi" && (
          <div className="space-y-3">
            {selectedFastingContext.isFastStartDay && (
              <div className="card p-3">
                <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                  Hari Mulai Puasa
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Makan malam ini menjadi makan terakhir sebelum puasa pukul 20:00.
                </p>
              </div>
            )}
            {selectedMeal.meals.map((meal, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display font-bold" style={{ color: "var(--text-primary)" }}>
                    {meal.label}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{meal.time}</span>
                </div>
                <ul className="space-y-1">
                  {meal.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-muted)" }} className="flex-shrink-0 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
                {meal.notes && (
                  <p className="mt-2 text-xs italic pt-2 leading-relaxed"
                     style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    {meal.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Puasa ── */}
        {activeTab === "puasa" && (
          <div className="space-y-4">
            {/* Intro */}
            <div className="card p-4">
              <p className="text-sm font-display font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Puasa 36 Jam (Monk Fast)
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Siklus 2 minggu sekali: mulai Minggu 20:00, berakhir Selasa 08:00.
              </p>
            </div>

            {/* Status hari ini */}
            <div className="card p-4">
              <p className="section-label mb-2">Status Hari Ini</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {todayFastingContext.isActiveFastingWindow
                  ? todayFastingContext.phase?.title ?? "Puasa aktif"
                  : "Di luar jendela puasa"}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {todayFastingContext.exerciseGuidance}
              </p>
            </div>

            {/* Fase puasa */}
            <div className="space-y-2">
              <p className="section-label">Fase Puasa</p>
              {FASTING_SCHEDULE.phases.map((phase, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{phase.dayTime}</p>
                      <p className="text-sm font-display font-bold" style={{ color: "var(--text-primary)" }}>
                        {phase.title}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{phase.hourRange}</p>
                    </div>
                    {phase.isRestricted && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-display font-semibold flex-shrink-0"
                            style={{ background: "var(--bg-elevated)", border: "1px solid #3a1a1a", color: "var(--danger)" }}>
                        DILARANG
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                    {phase.description}
                  </p>
                  <ul className="space-y-1">
                    {phase.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>▸</span>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Siklus bulan ini */}
            <div className="space-y-2">
              <p className="section-label">Siklus {formatMonthLabel(new Date())}</p>
              {monthlyFastingEvents.map((event) => (
                <div key={event.startDateKey} className="card p-4">
                  <p className="text-sm font-display font-bold" style={{ color: "var(--text-primary)" }}>
                    {event.startDateKey} → {event.endDateKey}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Mulai {formatEventDateTime(event.startAt)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Selesai {formatEventDateTime(event.endAt)}
                  </p>
                </div>
              ))}
            </div>

            {/* Refeeding */}
            <div className="space-y-2">
              <p className="section-label">Protokol Berbuka (Refeeding)</p>
              {FASTING_SCHEDULE.refeeding.map((step, i) => (
                <div key={i} className="card p-4">
                  <p className="text-xs font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {step.time}
                  </p>
                  <ul className="space-y-1 mb-2">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--text-muted)" }} className="flex-shrink-0">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>{step.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Suplemen ── */}
        {activeTab === "suplemen" && (
          <div className="space-y-3">
            <div className="card p-3">
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Suplemen berkalori digeser ke refeeding otomatis pada hari puasa.
              </p>
            </div>

            {(["pagi", "siang", "sore", "malam"] as const).map((slot) => {
              const slotSupps = selectedSupplementSchedule.supplements.filter((s) => s.timingSlot === slot);
              if (slotSupps.length === 0) return null;
              return (
                <div key={slot} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-display font-bold" style={{ color: "var(--text-primary)" }}>
                      {SLOT_LABEL[slot]}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{SLOT_TIME[slot]}</p>
                  </div>
                  <div className="space-y-2">
                    {slotSupps.map((supp, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-elevated)" }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{supp.name}</p>
                          <span className="text-[11px] flex-shrink-0 px-2 py-0.5 rounded-full"
                                style={{ background: "var(--border)", color: "var(--text-secondary)" }}>
                            {supp.dose}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{supp.notes}</p>
                        {supp.warningIfCombined && (
                          <div className="mt-1.5 rounded-lg p-2"
                               style={{ background: "var(--bg-elevated)", border: "1px solid #5a4a1a" }}>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--warning)" }}>
                              {supp.warningIfCombined}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Skincare ── */}
        {activeTab === "skincare" && (
          <div className="space-y-4">
            <div className="card p-3">
              <p className="text-xs font-display font-bold" style={{ color: "var(--text-primary)" }}>
                {selectedSkincare.dayName} · {selectedSkincare.pmLabel}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Rutinitas pagi selalu sama; malam mengikuti jadwal mingguan.
              </p>
            </div>

            {/* AM */}
            <div>
              <p className="section-label mb-2">Rutinitas Pagi — {selectedSkincare.amLabel}</p>
              <div className="space-y-2">
                {selectedSkincare.amRoutine.map((step) => (
                  <div key={step.order} className="card p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-[11px] font-bold w-4 flex-shrink-0 mt-0.5"
                            style={{ color: "var(--text-muted)" }}>
                        {step.order}.
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {step.productShort}
                        </p>
                        {step.notes && (
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PM */}
            <div>
              <p className="section-label mb-2">Rutinitas Malam — {selectedSkincare.pmLabel}</p>
              <div className="space-y-2">
                {selectedSkincare.pmRoutine.map((step) => (
                  <div key={step.order} className="card p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-[11px] font-bold w-4 flex-shrink-0 mt-0.5"
                            style={{ color: "var(--text-muted)" }}>
                        {step.order}.
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {step.productShort}
                        </p>
                        {step.notes && (
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {step.notes}
                          </p>
                        )}
                        {step.warningNote && (
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--warning)" }}>
                            {step.warningNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
