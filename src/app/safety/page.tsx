"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { getCompletionLogsInRange, getStreak, getUserPreferences } from "@/lib/firebase";
import { getDateKeysInRange, getLocalDateKey } from "@/lib/date";
import {
  calendarDayToCycleDay,
  formatShortDate,
  generateTasks,
} from "@/lib/utils";
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
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function getBarHeight(percent: number) {
  return Math.max(10, Math.round((percent / 100) * 120));
}

export default function SafetyPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);

      try {
        const prefs = await getUserPreferences();
        const today = getLocalDateKey();
        const [logs, streak] = await Promise.all([
          getCompletionLogsInRange(prefs.startDate, today),
          getStreak(today),
        ]);

        const logMap = new Map<string, CompletionLog>(
          logs.map((log) => [log.dateKey, log]),
        );
        const series = getDateKeysInRange(prefs.startDate, today).map((dateKey) => {
          const dayIndex = calendarDayToCycleDay(dateKey, prefs.startDate);
          const totalCount = generateTasks(dayIndex, dateKey, prefs).length;
          const completedCount = Math.min(
            logMap.get(dateKey)?.completedTaskIds.length ?? 0,
            totalCount,
          );

          return {
            dateKey,
            completionPercent:
              totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
            completedCount,
            totalCount,
          };
        });

        const last7 = series.slice(-7);
        const last30 = series.slice(-30);
        const recoveryDays = series.filter(
          (point, index) =>
            index > 0 &&
            point.completedCount > 0 &&
            series[index - 1].completedCount === 0,
        ).length;
        const strongDays7 = last7.filter((point) => point.completionPercent >= 70).length;

        setSummary({
          prefs,
          streak,
          avg7: average(last7.map((point) => point.completionPercent)),
          avg30: average(last30.map((point) => point.completionPercent)),
          perfectDays: series.filter((point) => point.completionPercent === 100).length,
          totalCompleted7: sum(last7.map((point) => point.completedCount)),
          totalCompleted30: sum(last30.map((point) => point.completedCount)),
          last7,
          last30,
          recoveryDays,
          strongDays7,
        });
      } catch (error) {
        console.error("Failed to load progress page:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-jade-500 border-t-transparent animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col min-h-screen pb-28">
        <Header
          title="Progress & Achievement"
          subtitle="Grafik mingguan dan bulanan"
        />
        <div className="px-5">
          <div className="card p-6 text-center text-sm text-gray-500">
            Data progress belum tersedia.
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const metricCards = [
    { label: "Streak Aktif", value: `${summary.streak}`, tone: "text-orange-300", bg: "bg-orange-950/30 border-orange-800/40" },
    { label: "Rata-rata 7 Hari", value: `${summary.avg7}%`, tone: "text-jade-300", bg: "bg-jade-950/30 border-jade-800/40" },
    { label: "Rata-rata 30 Hari", value: `${summary.avg30}%`, tone: "text-indigo-300", bg: "bg-indigo-950/30 border-indigo-800/40" },
    { label: "Perfect Days", value: `${summary.perfectDays}`, tone: "text-yellow-300", bg: "bg-yellow-950/20 border-yellow-800/30" },
    { label: "Task Selesai 7 Hari", value: `${summary.totalCompleted7}`, tone: "text-emerald-300", bg: "bg-emerald-950/25 border-emerald-800/30" },
    { label: "Task Selesai 30 Hari", value: `${summary.totalCompleted30}`, tone: "text-blue-300", bg: "bg-blue-950/25 border-blue-800/30" },
  ];

  const achievements = [
    {
      title: "Streak Aktif",
      value: `${summary.streak} hari`,
      description:
        summary.streak > 0
          ? "Ada progres beruntun hingga hari ini."
          : "Belum ada streak aktif. Mulai lagi dari checklist hari ini.",
      accent: "border-orange-800/40 bg-orange-950/25 text-orange-300",
    },
    {
      title: "Perfect Day Count",
      value: `${summary.perfectDays} hari`,
      description:
        summary.perfectDays > 0
          ? "Jumlah hari dengan completion 100% sejak program dimulai."
          : "Belum ada hari dengan completion penuh.",
      accent: "border-yellow-800/40 bg-yellow-950/20 text-yellow-300",
    },
    {
      title: "Recovery Consistency",
      value: `${summary.recoveryDays} kali`,
      description:
        summary.recoveryDays > 0
          ? "Hari aktif yang muncul tepat setelah hari kosong."
          : "Belum ada pola recovery yang tercatat.",
      accent: "border-jade-800/40 bg-jade-950/20 text-jade-300",
    },
    {
      title: "Strong Week",
      value: `${summary.strongDays7}/7 hari`,
      description:
        summary.strongDays7 > 0
          ? "Hari dalam 7 hari terakhir yang mencapai minimal 70% completion."
          : "Belum ada hari kuat dalam 7 hari terakhir.",
      accent: "border-indigo-800/40 bg-indigo-950/20 text-indigo-300",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header
        title="Progress & Achievement"
        subtitle="Grafik 7 hari, 30 hari, dan metrik real dari completion log"
      />

      <div className="px-5 space-y-5">
        <div className="grid grid-cols-2 gap-2">
          {metricCards.map((card) => (
            <div key={card.label} className={`rounded-2xl border p-3 ${card.bg}`}>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
              <p className={`mt-2 text-xl font-display font-bold ${card.tone}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
                Grafik Mingguan
              </p>
              <h2 className="text-base font-display font-bold text-gray-200">
                Completion 7 Hari Terakhir
              </h2>
            </div>
            <span className="rounded-full border border-jade-800/40 bg-jade-950/30 px-3 py-1 text-xs font-display font-semibold text-jade-300">
              Avg {summary.avg7}%
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-44">
            {summary.last7.map((point) => (
              <div key={point.dateKey} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-gray-600">
                  {point.completionPercent}%
                </span>
                <div className="w-full max-w-[28px] h-32 rounded-full bg-night-800/70 relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-jade-600 via-emerald-500 to-cyan-400"
                    style={{ height: `${getBarHeight(point.completionPercent)}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">
                  {formatShortDate(point.dateKey).split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
                Grafik Bulanan
              </p>
              <h2 className="text-base font-display font-bold text-gray-200">
                Completion 30 Hari Terakhir
              </h2>
            </div>
            <span className="rounded-full border border-indigo-800/40 bg-indigo-950/30 px-3 py-1 text-xs font-display font-semibold text-indigo-300">
              Avg {summary.avg30}%
            </span>
          </div>

          <div className="grid grid-cols-10 gap-2">
            {summary.last30.map((point) => (
              <div
                key={point.dateKey}
                className="rounded-xl border border-night-700/40 bg-night-900/60 p-2 text-center"
              >
                <div className="mx-auto h-16 w-3 rounded-full bg-night-800/80 overflow-hidden">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-indigo-600 via-blue-500 to-cyan-400"
                    style={{ height: `${Math.max(8, point.completionPercent)}%`, marginTop: `${100 - Math.max(8, point.completionPercent)}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-gray-500">
                  {formatShortDate(point.dateKey).replace(".", "")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
              Achievement
            </p>
            <h2 className="text-base font-display font-bold text-gray-200 mt-1">
              Ringkasan Konsistensi
            </h2>
          </div>

          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`rounded-2xl border p-4 ${achievement.accent}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-display font-semibold uppercase tracking-wide">
                    {achievement.title}
                  </p>
                  <p className="mt-2 text-lg font-display font-bold">
                    {achievement.value}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white/70">
                  Real Data
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-300">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-night-700/40 bg-night-900/50 p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Semua grafik di halaman ini dihitung dari completion log aktual sejak{" "}
            <span className="text-jade-400">{summary.prefs.startDate}</span> dan
            jumlah task harian yang dihasilkan oleh tracker saat itu.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
