"use client";

import { useEffect, useState } from "react";
import { Timer, Droplets, AlertTriangle } from "lucide-react";
import { getFastingStatus } from "@/lib/utils";

export default function FastingCard() {
  const [status, setStatus] = useState<ReturnType<typeof getFastingStatus>>({
    isActive: false,
    phase: null,
    hourElapsed: 0,
    percentComplete: 0,
  });

  useEffect(() => {
    const update = () => {
      const current = new Date();
      setStatus(getFastingStatus(current));
    };
    update();
    const interval = setInterval(update, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  if (!status.isActive) {
    // Show next fasting info
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-night-700 flex items-center justify-center">
            <Timer size={14} className="text-gray-500" />
          </div>
          <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
            Puasa 36 Jam
          </span>
        </div>
        <p className="text-sm text-gray-400">
          Tidak aktif sekarang.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Puasa berikutnya: Minggu 20:00 → Selasa 08:00
        </p>
        <div className="mt-3 rounded-lg bg-night-800/60 p-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            💡 Mulai makan terakhir pra-puasa sebelum pukul 20:00 Minggu. Pastikan sarat protein dan serat.
          </p>
        </div>
      </div>
    );
  }

  const hourRemaining = 36 - status.hourElapsed;

  return (
    <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 backdrop-blur-sm p-4 glow-fasting">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-900/80 flex items-center justify-center">
            <Timer size={14} className="text-indigo-400 fasting-active" />
          </div>
          <span className="text-xs font-display font-semibold uppercase tracking-wide text-indigo-400">
            Puasa Aktif ⏳
          </span>
        </div>
        <span className="text-xs font-display font-bold text-indigo-300">
          {status.hourElapsed}j / 36j
        </span>
      </div>

      {/* Progress ring simulation */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-2xl font-display font-bold text-indigo-200">
            {status.percentComplete}%
          </span>
          <span className="text-sm text-indigo-400">
            ≈ {hourRemaining}j tersisa
          </span>
        </div>
        <div className="h-2 rounded-full bg-indigo-900/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
            style={{ width: `${status.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Current phase */}
      {status.phase && (
        <div className="rounded-lg bg-indigo-900/40 p-3 mb-3">
          <p className="text-xs font-display font-semibold text-indigo-300 mb-1">
            Fase Sekarang: {status.phase.title}
          </p>
          <p className="text-xs text-indigo-400/80 leading-relaxed">
            {status.phase.description}
          </p>
          {status.phase.isRestricted && (
            <div className="mt-2 flex items-start gap-1.5">
              <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400">
                ⛔ Latihan resistensi DILARANG pada fase ini
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {status.phase?.actions && (
        <div className="space-y-1.5">
          {status.phase.actions.map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-indigo-500 text-xs mt-0.5">▸</span>
              <p className="text-xs text-indigo-300/80">{action}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hydration reminder */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-900/30 p-2.5">
        <Droplets size={14} className="text-blue-400 flex-shrink-0" />
        <p className="text-xs text-blue-300">
          Target hidrasi: 3–4 liter total selama puasa
        </p>
      </div>

      {/* Red flags mini */}
      <div className="mt-2 rounded-lg bg-red-950/40 border border-red-900/40 p-2.5">
        <p className="text-xs text-red-400 font-semibold mb-1">🔴 Hentikan Puasa Jika:</p>
        <p className="text-xs text-red-400/80">
          Palpitasi jantung, pandangan gelap mendadak, tremor, atau disorientasi akut
        </p>
      </div>
    </div>
  );
}
