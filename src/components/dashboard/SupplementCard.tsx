"use client";

import { Pill } from "lucide-react";
import type { FastingContext } from "@/lib/fasting";
import type { SupplementSchedule } from "@/types";

interface SupplementCardProps {
  schedule: SupplementSchedule;
  fastingContext?: FastingContext | null;
}

const SLOT_ORDER = ["pagi", "siang", "sore", "malam"] as const;
const SLOT_LABEL: Record<string, string> = {
  pagi: "Pagi", siang: "Siang", sore: "Sore", malam: "Malam",
};
const SLOT_TIME: Record<string, string> = {
  pagi: "07:00–08:30", siang: "12:00–13:00", sore: "16:00–17:00", malam: "21:00–21:30",
};

export default function SupplementCard({ schedule, fastingContext }: SupplementCardProps) {
  const grouped = schedule.supplements.reduce((acc, supp) => {
    const slot = supp.timingSlot;
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(supp);
    return acc;
  }, {} as Record<string, typeof schedule.supplements>);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pill size={14} style={{ color: "var(--text-secondary)" }} />
        <p className="section-label">Jadwal Suplemen</p>
      </div>

      {fastingContext?.isStrictFastDay && (
        <div className="mb-3 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Puasa aktif — suplemen berkalori ditunda ke refeeding. Creatine & magnesium tetap jalan.
          </p>
        </div>
      )}
      {fastingContext?.isRefeedDay && (
        <div className="mb-3 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--success)" }}>
            Hari refeed — suplemen pagi/siang digeser ke slot refeeding.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {SLOT_ORDER.map((slot) => {
          const supps = grouped[slot] ?? [];
          if (supps.length === 0) return null;
          const timeLabel = supps[0]?.timeRange ?? SLOT_TIME[slot];
          return (
            <div key={slot} className="rounded-xl p-3" style={{ background: "var(--bg-elevated)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-bold" style={{ color: "var(--text-primary)" }}>
                  {SLOT_LABEL[slot]}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{timeLabel}</span>
              </div>
              <div className="space-y-1.5">
                {supps.map((supp, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{supp.name}</p>
                      {supp.dose && (
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{supp.dose}</p>
                      )}
                    </div>
                    {supp.withFood !== undefined && (
                      <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {supp.withFood ? "dengan makan" : "tanpa makan"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
