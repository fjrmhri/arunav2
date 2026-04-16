"use client";

import { Timer, Droplets, AlertTriangle } from "lucide-react";
import type { FastingContext } from "@/lib/fasting";
import { formatShortDate } from "@/lib/utils";

interface FastingCardProps {
  fastingContext: FastingContext | null;
}

export default function FastingCard({ fastingContext }: FastingCardProps) {
  if (!fastingContext) return null;

  // Not active + not prep
  if (!fastingContext.isFastingDay && !fastingContext.isFastStartDay) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Timer size={13} style={{ color: "var(--text-muted)" }} />
          <p className="section-label">Puasa 36 Jam</p>
        </div>
        <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Tidak aktif sekarang.</p>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Berikutnya: {formatShortDate(fastingContext.nextFast.startDateKey)} 20:00 → {formatShortDate(fastingContext.nextFast.endDateKey)} 08:00
        </p>
        <div className="mt-2.5 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)" }}>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Makan terakhir pra-puasa sebelum 20:00. Prioritaskan protein dan serat.
          </p>
        </div>
      </div>
    );
  }

  // Prep / refeed day (not yet in active window)
  if (!fastingContext.isActiveFastingWindow) {
    const title = fastingContext.isFastStartDay ? "Puasa Dimulai Nanti Malam" : "Refeeding Day";
    const detail = fastingContext.isFastStartDay
      ? "Mulai 20:00. Selesaikan makan terakhir sebelum waktu itu, hindari latihan berat mendekati waktu mulai."
      : "Puasa selesai 08:00. Pembuka ringan dulu, refeeding bertahap, tahan latihan berat sampai energi stabil.";

    return (
      <div className="card p-4" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer size={13} style={{ color: "var(--text-secondary)" }} />
            <p className="section-label">{title}</p>
          </div>
          <span className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>
            {fastingContext.hourElapsed}j / 36j
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{detail}</p>
        <div className="mt-2.5 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)" }}>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{fastingContext.exerciseGuidance}</p>
        </div>
      </div>
    );
  }

  // Active fasting window
  const hourRemaining = fastingContext.hourRemaining;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer size={13} className="fasting-active" style={{ color: "var(--text-secondary)" }} />
          <p className="section-label">Puasa Aktif</p>
        </div>
        <span className="text-[11px] font-bold font-display" style={{ color: "var(--text-primary)" }}>
          {fastingContext.hourElapsed}j / 36j
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
            {fastingContext.percentComplete}%
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>~{hourRemaining}j tersisa</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${fastingContext.percentComplete}%`, background: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Phase */}
      {fastingContext.phase && (
        <div className="rounded-lg p-2.5 mb-2" style={{ background: "var(--bg-elevated)" }}>
          <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {fastingContext.phase.title}
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {fastingContext.phase.description}
          </p>
          {fastingContext.phase.isRestricted && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertTriangle size={11} style={{ color: "var(--warning)" }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px]" style={{ color: "var(--warning)" }}>
                Latihan resistensi dilarang pada fase ini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Phase actions */}
      {fastingContext.phase?.actions && (
        <div className="space-y-1 mb-2">
          {fastingContext.phase.actions.map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>▸</span>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{action}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hydration */}
      <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: "var(--bg-elevated)" }}>
        <Droplets size={12} style={{ color: "var(--text-secondary)" }} />
        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {fastingContext.hydrationDetail}
        </p>
      </div>

      {/* Red flags */}
      <div className="mt-2 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: "1px solid #3a1a1a" }}>
        <p className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--danger)" }}>Hentikan jika:</p>
        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          Palpitasi, pandangan gelap mendadak, tremor, atau disorientasi.
        </p>
      </div>
    </div>
  );
}
