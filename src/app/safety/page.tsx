"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { getCompletionLogsInRange, getStreak, getUserPreferences } from "@/lib/firebase";
import { filterValidTaskIds } from "@/lib/completion";
import { getDateKeysInRange, getLocalDateKey } from "@/lib/date";
import { calendarDayToCycleDay, formatShortDate, generateTasks } from "@/lib/utils";
import type { CompletionLog, UserPreferences } from "@/types";

type ProgressPoint = {
  dateKey: string;
  completionPercent: number;
  completedCount: number;
  totalCount: number;
};

type ProgressSummary = {
  prefs: UserPreferences;
  streak: number;
  avg7: number;
  avg30: number;
  perfectDays: number;
  totalCompleted7: number;
  totalCompleted30: number;
  last7: ProgressPoint[];
  last30: ProgressPoint[];
  recoveryDays: number;
  strongDays7: number;
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
function sum(values: number[]) {
  return values.reduce((t, v) => t + v, 0);
}

export default function SafetyPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const prefs = await getUserPreferences();
        const today = getLocalDateKey();
        const [logs, streak] = await Promise.all([
          getCompletionLogsInRange(prefs.startDate, today),
          getStreak(today),
        ]);

        const logMap = new Map<string, CompletionLog>(logs.map((l) => [l.dateKey, l]));
        const series = getDateKeysInRange(prefs.startDate, today).map((dateKey) => {
          const dayIndex = calendarDayToCycleDay(dateKey, prefs.startDate);
          const validTaskIds = generateTasks(dayIndex, dateKey, prefs).map((t) => t.id);
          const totalCount = validTaskIds.length;
          const completedCount = filterValidTaskIds(
            logMap.get(dateKey)?.completedTaskIds ?? [],
            validTaskIds,
          ).length;
          return {
            dateKey,
            completionPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
            completedCount,
            totalCount,
          };
        });

        const last7 = series.slice(-7);
        const last30 = series.slice(-30);
        const recoveryDays = series.filter(
          (p, i) => i > 0 && p.completedCount > 0 && series[i - 1].completedCount === 0
        ).length;
        const strongDays7 = last7.filter((p) => p.completionPercent >= 70).length;

        setSummary({
          prefs, streak,
          avg7: average(last7.map((p) => p.completionPercent)),
          avg30: average(last30.map((p) => p.completionPercent)),
          perfectDays: series.filter((p) => p.completionPercent === 100).length,
          totalCompleted7: sum(last7.map((p) => p.completedCount)),
          totalCompleted30: sum(last30.map((p) => p.completedCount)),
          last7, last30, recoveryDays, strongDays7,
        });
      } catch (e) {
        console.error("Failed to load progress:", e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

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

  if (!summary) {
    return (
      <div className="flex flex-col min-h-screen pb-28">
        <Header title="Progress" subtitle="Belum ada data" />
        <div className="px-5">
          <div className="card p-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Data progress belum tersedia.
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const metrics = [
    { label: "Streak", value: `${summary.streak}` },
    { label: "Avg 7 Hari", value: `${summary.avg7}%` },
    { label: "Avg 30 Hari", value: `${summary.avg30}%` },
    { label: "Perfect Days", value: `${summary.perfectDays}` },
    { label: "Task 7 Hari", value: `${summary.totalCompleted7}` },
    { label: "Task 30 Hari", value: `${summary.totalCompleted30}` },
  ];

  const achievements = [
    {
      title: "Streak Aktif",
      value: `${summary.streak} hari`,
      desc: summary.streak > 0 ? "Ada progres beruntun hingga hari ini." : "Belum ada streak aktif.",
    },
    {
      title: "Perfect Days",
      value: `${summary.perfectDays} hari`,
      desc: summary.perfectDays > 0 ? "Hari dengan completion 100% sejak program dimulai." : "Belum ada hari perfect.",
    },
    {
      title: "Recovery",
      value: `${summary.recoveryDays}×`,
      desc: summary.recoveryDays > 0 ? "Hari aktif setelah hari kosong." : "Belum ada pola recovery tercatat.",
    },
    {
      title: "Strong Week",
      value: `${summary.strongDays7}/7`,
      desc: summary.strongDays7 > 0 ? "Hari ≥70% dalam 7 hari terakhir." : "Belum ada hari kuat minggu ini.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header title="Progress" subtitle="Completion log aktual" />

      <div className="px-5 space-y-4">

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="card p-3">
              <p className="section-label mb-1.5">{m.label}</p>
              <p className="text-xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* 7-day bar chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label mb-0.5">Mingguan</p>
              <p className="text-sm font-display font-bold" style={{ color: "var(--text-primary)" }}>
                7 Hari Terakhir
              </p>
            </div>
            <span className="text-xs font-bold font-display px-2.5 py-1 rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
              Avg {summary.avg7}%
            </span>
          </div>

          {/* Bar chart — clean bars, no gradient */}
          <div className="flex items-end gap-1.5 h-32">
            {summary.last7.map((point) => {
              const h = Math.max(4, Math.round((point.completionPercent / 100) * 112));
              return (
                <div key={point.dateKey} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {point.completionPercent > 0 ? `${point.completionPercent}%` : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "112px" }}>
                    <div
                      className="w-full rounded-sm transition-all duration-700"
                      style={{
                        height: `${h}px`,
                        background: point.completionPercent === 100
                          ? "var(--text-primary)"
                          : point.completionPercent >= 70
                          ? "#888"
                          : "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {formatShortDate(point.dateKey).split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-day heatmap */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label mb-0.5">Bulanan</p>
              <p className="text-sm font-display font-bold" style={{ color: "var(--text-primary)" }}>
                30 Hari Terakhir
              </p>
            </div>
            <span className="text-xs font-bold font-display px-2.5 py-1 rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
              Avg {summary.avg30}%
            </span>
          </div>

          {/* Heatmap grid — 6×5 */}
          <div className="grid grid-cols-6 gap-1.5">
            {summary.last30.map((point) => {
              const opacity = point.completionPercent === 0
                ? 0.08
                : point.completionPercent === 100
                ? 1
                : 0.2 + (point.completionPercent / 100) * 0.75;
              return (
                <div
                  key={point.dateKey}
                  title={`${formatShortDate(point.dateKey)}: ${point.completionPercent}%`}
                  className="aspect-square rounded"
                  style={{ background: `rgba(238,238,238,${opacity})` }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>0%</span>
            {[0.08, 0.35, 0.6, 0.85, 1].map((o, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(238,238,238,${o})` }} />
            ))}
            <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>100%</span>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <p className="section-label mb-3">Konsistensi</p>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => (
              <div key={a.title} className="card p-3">
                <p className="section-label mb-1">{a.title}</p>
                <p className="text-lg font-display font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {a.value}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-center pb-2" style={{ color: "var(--text-muted)" }}>
          Dihitung dari log aktual sejak {summary.prefs.startDate}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
