"use client";

import { Pill, AlertTriangle, Clock, Info } from "lucide-react";
import { SUPPLEMENTS_BASE } from "@/data/fitness-seed";
import { cn } from "@/lib/utils";

interface SupplementCardProps {
  isFastingDay?: boolean;
}

const SLOT_META = {
  pagi: { label: "Pagi", time: "07:00–08:30", icon: "🌅", color: "text-yellow-400", bg: "bg-yellow-950/30 border-yellow-800/40" },
  siang: { label: "Siang", time: "12:00–13:00", icon: "☀️", color: "text-orange-400", bg: "bg-orange-950/30 border-orange-800/40" },
  sore: { label: "Sore", time: "16:00–17:00", icon: "🌤️", color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-800/40" },
  malam: { label: "Malam", time: "21:00–21:30", icon: "🌙", color: "text-blue-400", bg: "bg-blue-950/30 border-blue-800/40" },
};

const SLOT_ORDER = ["pagi", "siang", "sore", "malam"] as const;

export default function SupplementCard({ isFastingDay }: SupplementCardProps) {
  // Group supplements by timingSlot
  const grouped = SUPPLEMENTS_BASE.reduce((acc, supp) => {
    const slot = supp.timingSlot;
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(supp);
    return acc;
  }, {} as Record<string, typeof SUPPLEMENTS_BASE>);

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-emerald-900/60 flex items-center justify-center">
          <Pill size={14} className="text-emerald-400" />
        </div>
        <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
          Jadwal Suplemen Harian
        </span>
      </div>

      {/* Fasting day note */}
      {isFastingDay && (
        <div className="mb-4 rounded-xl bg-indigo-950/50 border border-indigo-800/50 p-3">
          <p className="text-xs text-indigo-400">
            ⏳ <strong>Hari Puasa:</strong> Semua suplemen kecuali Creatine dikonsumsi saat berbuka (08:00+) bersama refeeding. Creatine tetap dikonsumsi sore hari — aman saat puasa.
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {SLOT_ORDER.map((slot) => {
          const supps = grouped[slot] ?? [];
          if (supps.length === 0) return null;
          const meta = SLOT_META[slot];

          return (
            <div key={slot} className={cn("rounded-xl border p-3", meta.bg)}>
              {/* Slot header */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base">{meta.icon}</span>
                <div>
                  <span className={cn("text-xs font-display font-bold uppercase tracking-wide", meta.color)}>
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-gray-600" />
                    <span className="text-[10px] text-gray-600">{meta.time}</span>
                  </div>
                </div>
              </div>

              {/* Supplements in this slot */}
              <div className="space-y-2">
                {supps.map((supp, i) => (
                  <div key={i} className="rounded-lg bg-night-900/60 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-200 leading-snug flex-1">
                        {supp.name}
                      </p>
                      <span className="text-xs font-display font-bold text-jade-400 bg-jade-950/60 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                        {supp.dose}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {supp.notes}
                    </p>

                    {/* CONFLICT note */}
                    {supp.conflictNote && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-orange-950/40 border border-orange-800/40 p-2">
                        <Info size={11} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-400/80 leading-relaxed">
                          {supp.conflictNote}
                        </p>
                      </div>
                    )}

                    {/* Interaction warning */}
                    {supp.warningIfCombined && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-500/70 leading-relaxed">
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

      {/* Critical interaction reminder */}
      <div className="mt-4 rounded-xl bg-red-950/30 border border-red-900/40 p-3">
        <p className="text-xs font-display font-semibold text-red-400 mb-1.5">
          ⚠️ Interaksi Kritis — Wajib Dipatuhi
        </p>
        <div className="space-y-1">
          <p className="text-xs text-red-400/70 leading-relaxed">
            • Hemaviton Dosis 2, Om3heart, dan Vitamin D3 wajib selesai maksimal pukul <strong>13:00</strong> setelah makan siang berlemak.
          </p>
          <p className="text-xs text-red-400/70 leading-relaxed">
            • Alliwise Magnesium Glycinate dikonsumsi pukul <strong>21:00–21:30</strong>, minimal <strong>8 jam</strong> setelah Hemaviton siang.
          </p>
        </div>
      </div>
    </div>
  );
}
