"use client";

import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import SafetyCard from "@/components/ui/SafetyCard";
import { SAFETY_NOTES } from "@/data/safety-seed";
import { FASTING_SCHEDULE } from "@/data/fitness-seed";
import { cn } from "@/lib/utils";
import type { SafetyNote } from "@/types";

type CategoryFilter = SafetyNote["category"] | "all";

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: "all",        label: "Semua" },
  { key: "fasting",    label: "Puasa" },
  { key: "supplement", label: "Suplemen" },
  { key: "exercise",   label: "Latihan" },
  { key: "skincare",   label: "Skincare" },
  { key: "medical",    label: "Medis" },
];

const SEVERITY_ORDER: Record<SafetyNote["severity"], number> = {
  danger: 0,
  warning: 1,
  unknown: 2,
  info: 3,
};

export default function SafetyPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");

  const notes = SAFETY_NOTES
    .filter((note) => category === "all" || note.category === category)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const showFastingProtocol = category === "all" || category === "fasting";

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header title="Safety" subtitle="Peringatan, asumsi, dan batasan program" />

      <div className="px-5 space-y-4">
        <div
          className="flex gap-1.5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
              className={cn("tab-pill", category === key && "active")}
            >
              {label}
            </button>
          ))}
        </div>

        {showFastingProtocol && (
          <div className="card p-4 space-y-3" style={{ border: "1px solid #3a1a1a" }}>
            <p className="section-label">Hentikan Puasa Jika</p>
            <ul className="space-y-1.5">
              {FASTING_SCHEDULE.redFlags.map((flag) => (
                <li key={flag} className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {flag}
                </li>
              ))}
            </ul>
            <p className="section-label pt-1">Protokol Elektrolit</p>
            <ul className="space-y-1.5">
              {FASTING_SCHEDULE.electrolyteProtocol.map((item) => (
                <li key={item} className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          {notes.map((note) => (
            <SafetyCard key={note.id} note={note} />
          ))}
        </div>

        <p className="text-[11px] text-center pb-2" style={{ color: "var(--text-secondary)" }}>
          Bukan pengganti saran medis profesional.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
