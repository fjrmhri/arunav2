"use client";

import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import SafetyCard from "@/components/ui/SafetyCard";
import { SAFETY_NOTES } from "@/data/safety-seed";
import { cn } from "@/lib/utils";

type FilterTab = "semua" | "fasting" | "supplement" | "skincare" | "exercise" | "medical";

export default function SafetyPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("semua");
  const [showOnlyDanger, setShowOnlyDanger] = useState(false);

  const FILTERS: { key: FilterTab; label: string; icon: string }[] = [
    { key: "semua", label: "Semua", icon: "🛡️" },
    { key: "medical", label: "Medis", icon: "🏥" },
    { key: "fasting", label: "Puasa", icon: "⏳" },
    { key: "supplement", label: "Suplemen", icon: "💊" },
    { key: "skincare", label: "Skincare", icon: "✨" },
    { key: "exercise", label: "Latihan", icon: "💪" },
  ];

  const filtered = SAFETY_NOTES.filter((note) => {
    const catMatch = activeFilter === "semua" || note.category === activeFilter;
    const sevMatch = !showOnlyDanger || note.severity === "danger";
    return catMatch && sevMatch;
  });

  const dangerCount = SAFETY_NOTES.filter((n) => n.severity === "danger").length;
  const warningCount = SAFETY_NOTES.filter((n) => n.severity === "warning").length;
  const unknownCount = SAFETY_NOTES.filter((n) => n.tag === "UNKNOWN" || n.tag === "ASSUMPTION").length;

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header
        title="Safety & Catatan"
        subtitle="Warning dan asumsi langsung dari PDF"
      />

      <div className="px-5 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-3 text-center">
            <p className="text-xl font-display font-bold text-red-400">{dangerCount}</p>
            <p className="text-[10px] text-red-500 uppercase font-display">Bahaya</p>
          </div>
          <div className="rounded-xl bg-yellow-950/30 border border-yellow-800/50 p-3 text-center">
            <p className="text-xl font-display font-bold text-yellow-400">{warningCount}</p>
            <p className="text-[10px] text-yellow-500 uppercase font-display">Peringatan</p>
          </div>
          <div className="rounded-xl bg-purple-950/30 border border-purple-800/50 p-3 text-center">
            <p className="text-xl font-display font-bold text-purple-400">{unknownCount}</p>
            <p className="text-[10px] text-purple-500 uppercase font-display">Unknown/Asumsi</p>
          </div>
        </div>

        {/* Source note */}
        <div className="rounded-xl bg-night-800/40 border border-night-700/30 p-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            📋 Seluruh catatan ini bersumber langsung dari <strong className="text-gray-400">1.pdf</strong> (kebugaran & nutrisi) dan <strong className="text-gray-400">2.pdf</strong> (skincare). Tidak ada informasi yang ditambahkan di luar isi PDF. Program ini berstatus <em>evidence-based theoretical planning</em> dan <strong className="text-red-400">bukan substitusi konsultasi dokter</strong>.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all border",
                activeFilter === key
                  ? "bg-jade-800/70 text-jade-300 border-jade-700/60"
                  : "bg-night-800/60 text-gray-500 border-night-700/50"
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Danger only toggle */}
        <button
          onClick={() => setShowOnlyDanger(!showOnlyDanger)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-semibold border transition-all",
            showOnlyDanger
              ? "bg-red-900/50 border-red-700/50 text-red-300"
              : "bg-night-800/40 border-night-700/40 text-gray-500"
          )}
        >
          🔴 {showOnlyDanger ? "Tampilkan Semua" : "Hanya Bahaya Kritis"}
        </button>

        {/* Notes list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-500">Tidak ada catatan untuk filter ini.</p>
            </div>
          )}
          {filtered.map((note) => (
            <SafetyCard key={note.id} note={note} />
          ))}
        </div>

        {/* UNKNOWN/ASSUMPTION summary box */}
        <div className="rounded-2xl border border-purple-800/50 bg-purple-950/30 p-4">
          <p className="text-xs font-display font-semibold text-purple-300 mb-3 uppercase tracking-wide">
            🔍 Ringkasan UNKNOWN & ASSUMPTION
          </p>
          <div className="space-y-2">
            {[
              { label: "Usia subjek", value: "UNKNOWN → ASSUMED 30 tahun" },
              { label: "Status tekanan darah", value: "UNKNOWN → ASSUMED normotensi" },
              { label: "Riwayat GERD/gastritis", value: "UNKNOWN → ASSUMED tidak ada" },
              { label: "Fungsi ginjal & hati", value: "UNKNOWN → ASSUMED normal" },
              { label: "Pola tidur", value: "UNKNOWN → ASSUMED 7–8 jam/malam" },
              { label: "Komposisi Makarizo FW lengkap", value: "UNKNOWN" },
              { label: "Komposisi Marina Body Lotion lengkap", value: "UNKNOWN" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-purple-600 text-xs mt-0.5 flex-shrink-0">·</span>
                <div>
                  <span className="text-xs text-gray-500">{item.label}: </span>
                  <span className="text-xs text-purple-300">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Washout emergency protocol */}
        <div className="rounded-2xl border border-red-800/60 bg-red-950/40 p-4">
          <p className="text-xs font-display font-semibold text-red-400 mb-3 uppercase tracking-wide">
            🚨 Washout Emergency — Skincare
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Aktivkan jika kulit tiba-tiba merah, perih/cekit-cekit saat pakai pelembap biasa:
          </p>
          <ol className="space-y-1.5">
            {[
              "Hentikan SEMUA bahan aktif keras: AHA/BHA Toner, Serum 10%, Clay Mask",
              "Durasi: 5–7 hari berturut-turut tanpa bahan aktif",
              "Rutinitas: Makarizo FW (malam saja, pagi cukup bilas air) → Blueberry Ceramide → Azarine SPF45 (pagi)",
              "Jika tidak membaik dalam 5 hari, konsultasi dokter kulit",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                <span className="text-xs text-red-400/80 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
