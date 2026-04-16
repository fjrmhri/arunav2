"use client";

import { useEffect, useState } from "react";
import { StickyNote, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import ProgressBar from "@/components/ui/ProgressBar";
import ChecklistItem from "@/components/ui/ChecklistItem";
import { useTracker } from "@/hooks/useTracker";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, { label: string }> = {
  exercise:    { label: "Latihan" },
  nutrition:   { label: "Nutrisi & Makan" },
  supplement:  { label: "Suplemen" },
  fasting:     { label: "Puasa 36 Jam" },
  skincare_am: { label: "Skincare Pagi" },
  skincare_pm: { label: "Skincare Malam" },
  hydration:   { label: "Hidrasi" },
};

export default function TrackerPage() {
  const {
    allTasks, completedIds, progressPercent, log, fastingContext, skincare,
    toggleTask, updateNotes, updateSkinReaction, loading,
  } = useTracker();

  const [notesValue, setNotesValue] = useState(log?.notes ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => { setNotesValue(log?.notes ?? ""); }, [log?.notes]);

  const grouped = allTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof allTasks>);

  const categories = Object.keys(grouped);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border border-t-transparent animate-spin"
               style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleNotesSave = async () => { await updateNotes(notesValue); };

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header title="Daily Tracker" subtitle={skincare?.dayName ?? "—"} />

      <div className="px-5 space-y-4">
        {/* Progress + filter */}
        <div className="card p-4">
          <ProgressBar
            percent={progressPercent}
            label="Progress"
            sublabel={`${completedIds.length}/${allTasks.length} tugas`}
            height="normal"
          />

          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveCategory(null)}
              className={cn("tab-pill", activeCategory === null && "active")}
            >
              Semua
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_LABELS[cat];
              if (!meta) return null;
              const done = grouped[cat].filter((t) => completedIds.includes(t.id)).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={cn("tab-pill", activeCategory === cat && "active")}
                >
                  {meta.label} {done}/{grouped[cat].length}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fasting alerts */}
        {fastingContext?.isStrictFastDay && (
          <div className="card p-3">
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
              Puasa 36 Jam Aktif
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Tanpa kalori sampai refeeding. Prioritaskan 3–4L air, elektrolit jika perlu.
            </p>
          </div>
        )}
        {fastingContext?.isFastStartDay && !fastingContext.isStrictFastDay && (
          <div className="card p-3">
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
              Puasa Mulai Pukul 20:00
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Jadikan makan malam sebagai makan terakhir pra-puasa.
            </p>
          </div>
        )}
        {fastingContext?.isRefeedDay && !fastingContext.isActiveFastingWindow && (
          <div className="card p-3">
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--success)" }}>
              Refeeding Day
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Mulai ringan 08:00, tahan latihan berat sampai energi stabil.
            </p>
          </div>
        )}
        {skincare?.isRecoveryDay && (
          <div className="card p-3">
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
              Hari Pemulihan Skincare
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Tidak ada bahan aktif keras malam ini.
            </p>
          </div>
        )}

        {/* Checklists */}
        {categories.map((cat) => {
          const meta = CATEGORY_LABELS[cat] ?? { label: cat };
          const tasks = grouped[cat];
          if (activeCategory && activeCategory !== cat) return null;

          const done = tasks.filter((t) => completedIds.includes(t.id)).length;
          const pct = Math.round((done / tasks.length) * 100);

          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="section-label">{meta.label}</span>
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{done}/{tasks.length}</span>
              </div>

              {/* Mini category bar */}
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: "var(--text-primary)" }}
                />
              </div>

              <div className="space-y-1">
                {tasks.map((task) => (
                  <ChecklistItem
                    key={task.id}
                    id={task.id}
                    label={task.label}
                    detail={task.detail}
                    checked={completedIds.includes(task.id)}
                    onToggle={toggleTask}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Skin reaction */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">Reaksi Kulit Hari Ini</span>
          </div>
          <div className="flex gap-2">
            {(["none", "mild", "severe"] as const).map((r) => {
              const isActive = log?.skinReaction === r;
              return (
                <button
                  key={r}
                  onClick={() => updateSkinReaction(r)}
                  className="flex-1 py-2 rounded-xl text-xs font-display font-semibold border transition-all"
                  style={{
                    background: isActive ? "var(--bg-elevated)" : "transparent",
                    border: `1px solid ${isActive ? "var(--text-muted)" : "var(--border)"}`,
                    color: isActive
                      ? r === "severe" ? "var(--danger)" : r === "mild" ? "var(--warning)" : "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  {r === "none" ? "Normal" : r === "mild" ? "Ringan" : "Parah"}
                </button>
              );
            })}
          </div>
          {log?.skinReaction === "severe" && (
            <div className="mt-2 rounded-lg p-2.5"
                 style={{ background: "var(--bg-elevated)", border: "1px solid #3a1a1a" }}>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--danger)" }}>
                Aktifkan Washout: hentikan AHA/BHA, serum 10%, clay mask selama 5–7 hari. Pakai hanya cleanser + ceramide + SPF.
              </p>
            </div>
          )}
        </div>



        {/* Notes */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={13} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">Catatan Harian</span>
          </div>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesSave}
            placeholder="Observasi, keluhan, atau catatan hari ini..."
            rows={4}
            className="w-full rounded-xl p-3 text-sm resize-none focus:outline-none transition-colors"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
