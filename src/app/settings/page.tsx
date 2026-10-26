"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { getUserPreferences, saveUserPreferences } from "@/lib/firebase";
import { getFastingContext } from "@/lib/fasting";
import { flushSyncQueue, getSyncSecret, setSyncSecret, type SyncResult } from "@/lib/githubSync";
import { isValidDateKey } from "@/lib/syncValidation";
import { getLocalDateKey } from "@/lib/date";
import { formatShortDate } from "@/lib/utils";

const SYNC_RESULT_LABEL: Record<SyncResult, string> = {
  ok: "Sync berhasil.",
  empty: "Tidak ada data untuk disinkronkan.",
  "rate-limited": "Baru saja sync, coba lagi sebentar.",
  "no-secret": "Isi Sync Secret dulu.",
  paused: "Sync sedang dijeda setelah ditolak server.",
  unauthorized: "Ditolak: Sync Secret tidak cocok dengan SYNC_SECRET di Vercel.",
  disabled: "Server belum dikonfigurasi (SYNC_SECRET / GITHUB_TOKEN / GITHUB_OBSIDIAN_REPO).",
  error: "Sync gagal. Cek koneksi atau log Vercel.",
};

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [lastFastStartDate, setLastFastStartDate] = useState("");
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const prefs = await getUserPreferences();
      setStartDate(prefs.startDate);
      setLastFastStartDate(prefs.lastFastStartDate ?? "");
      setSecret(getSyncSecret());
      setLoading(false);
    };
    void load();
  }, []);

  const startDateValid = isValidDateKey(startDate);
  const lastFastValid = lastFastStartDate === "" || isValidDateKey(lastFastStartDate);
  const canSave = startDateValid && lastFastValid;

  const previewPrefs = canSave
    ? { startDate, lastFastStartDate: lastFastStartDate || undefined }
    : null;
  const nextFast = previewPrefs
    ? getFastingContext(getLocalDateKey(), previewPrefs, new Date()).nextFast
    : null;

  const handleSave = async () => {
    if (!canSave) return;
    await saveUserPreferences({
      startDate,
      lastFastStartDate: lastFastStartDate || undefined,
    });
    setSyncSecret(secret);
    setStatus("Pengaturan tersimpan.");
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSecret(secret);
    const result = await flushSyncQueue(true);
    setStatus(SYNC_RESULT_LABEL[result]);
    setSyncing(false);
  };

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

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header title="Pengaturan" subtitle="Program dan sinkronisasi" />

      <div className="px-5 space-y-4">
        {/* Program */}
        <div className="card p-4 space-y-3">
          <p className="section-label">Program</p>

          <label className="block">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Tanggal mulai program
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl p-3 text-sm"
              style={inputStyle}
            />
          </label>

          <label className="block">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Tanggal mulai puasa 36 jam terakhir (opsional)
            </span>
            <input
              type="date"
              value={lastFastStartDate}
              onChange={(e) => setLastFastStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl p-3 text-sm"
              style={inputStyle}
            />
            <span className="mt-1 block text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Biasanya hari Minggu. Jika kosong, puasa pertama dihitung dari Minggu
              pertama setelah tanggal mulai program, lalu berulang setiap 14 hari.
            </span>
          </label>

          {nextFast && (
            <p className="text-xs" style={{ color: "var(--text-primary)" }}>
              Puasa berikutnya: {formatShortDate(nextFast.startDateKey)} 20:00 sampai{" "}
              {formatShortDate(nextFast.endDateKey)} 08:00
            </p>
          )}
          {!canSave && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>
              Tanggal tidak valid.
            </p>
          )}
        </div>

        {/* Sync Obsidian */}
        <div className="card p-4 space-y-3">
          <p className="section-label">Sync Obsidian</p>

          <label className="block">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Sync Secret (sama dengan SYNC_SECRET di Vercel)
            </span>
            <input
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1 w-full rounded-xl p-3 text-sm"
              style={inputStyle}
            />
            <span className="mt-1 block text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Disimpan hanya di perangkat ini. Tanpa secret, sync tidak berjalan.
            </span>
          </label>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="w-full rounded-xl py-3 text-xs font-display font-semibold disabled:opacity-40"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            {syncing ? "Menyinkronkan..." : "Sync sekarang"}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full rounded-xl py-3 text-sm font-display font-semibold disabled:opacity-40"
          style={{ background: "var(--text-primary)", color: "var(--bg)" }}
        >
          Simpan
        </button>

        {status && (
          <p role="status" className="text-center text-xs" style={{ color: "var(--text-secondary)" }}>
            {status}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
