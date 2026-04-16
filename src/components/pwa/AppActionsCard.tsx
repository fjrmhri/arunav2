"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatReminderDateTime,
  getSupplementReminderSlots,
  getDailyDigestSlot,
  type DailyDigestInfo,
} from "@/lib/supplementReminders";
import type { Supplement } from "@/types";
import type { FastingContext } from "@/lib/fasting";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface AppActionsCardProps {
  dateKey: string;
  fastingContext?: FastingContext | null;
  notificationsEnabled: boolean;
  supplements: Supplement[];
  onNotificationSettingChange: (enabled: boolean) => Promise<void> | void;
  digestInfo?: DailyDigestInfo;
}

type NotificationState = NotificationPermission | "unsupported";
type ReminderLedger = Record<string, number>;

const REMINDER_LEDGER_KEY = "supplement_reminder_ledger_v2";
const REMINDER_GRACE_MS = 45 * 60 * 1000;

function readReminderLedger(): ReminderLedger {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(REMINDER_LEDGER_KEY);
    return raw ? (JSON.parse(raw) as ReminderLedger) : {};
  } catch {
    return {};
  }
}

function writeReminderLedger(ledger: ReminderLedger) {
  if (typeof window === "undefined") return;

  const pruned = Object.fromEntries(
    Object.entries(ledger).filter(
      ([, timestamp]) => Date.now() - timestamp < 3 * 24 * 60 * 60 * 1000,
    ),
  );
  localStorage.setItem(REMINDER_LEDGER_KEY, JSON.stringify(pruned));
}

async function showReminderNotification(
  title: string,
  body: string,
  tag: string,
) {
  const actions = [{ action: "open_tracker", title: "Buka Tracker" }];

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: "/tracker" },
      // @ts-expect-error actions is supported in Chrome/Android but not in all TS notification typings
      actions,
    });
    return;
  }

  new Notification(title, {
    body,
    tag,
    icon: "/icon-192.png",
  });
}

export default function AppActionsCard({
  dateKey,
  fastingContext,
  notificationsEnabled,
  supplements,
  onNotificationSettingChange,
  digestInfo,
}: AppActionsCardProps) {
  const [, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [, setIsInstalled] = useState(false);
  const [, setStandaloneMode] = useState(false);
  const [, setServiceWorkerAktif] = useState(false);
  const [, setPromptInstallTersedia] = useState(false);
  const [isReminderExpanded, setIsReminderExpanded] = useState(true);
  const [notificationState, setNotificationState] =
    useState<NotificationState>("unsupported");
  const [nextReminderLabel, setNextReminderLabel] = useState<string | null>(
    null,
  );

  const reminderSlots = useMemo(() => {
    const supplementSlots = getSupplementReminderSlots(
      dateKey,
      supplements,
      fastingContext,
    );
    if (!digestInfo) return supplementSlots;
    const digestSlot = getDailyDigestSlot(dateKey, digestInfo);
    return [digestSlot, ...supplementSlots];
  }, [dateKey, supplements, fastingContext, digestInfo]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsInstalled(standalone);
    setStandaloneMode(standalone);

    setPromptInstallTersedia(false);

    if (navigator.serviceWorker) {
      if (navigator.serviceWorker.controller) {
        setServiceWorkerAktif(true);
      }

      navigator.serviceWorker.ready
        .then(() => {
          setServiceWorkerAktif(true);
          console.log("[PWA] Service worker ready");
        })
        .catch((error) => {
          console.error("[PWA] Service worker ready error:", error);
          setServiceWorkerAktif(false);
        });
    } else {
      setServiceWorkerAktif(false);
      console.warn("[PWA] serviceWorker is not available in this browser");
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const deferredEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(deferredEvent);
      setPromptInstallTersedia(true);
      console.log("[PWA] beforeinstallprompt available");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setStandaloneMode(true);
      setDeferredPrompt(null);
      setPromptInstallTersedia(false);
      console.log("[PWA] appinstalled event fired");
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setNotificationState("unsupported");
      return;
    }

    setNotificationState(Notification.permission);
  }, []);

  useEffect(() => {
    const now = Date.now();
    const nextReminder = reminderSlots.find(
      (slot) => slot.scheduledAt.getTime() > now,
    );

    setNextReminderLabel(
      nextReminder
        ? `${formatReminderDateTime(nextReminder.remindAt)} • ${nextReminder.items.join(", ")}`
        : null,
    );
  }, [reminderSlots]);

  useEffect(() => {
    if (!notificationsEnabled || notificationState !== "granted") return;
    if (typeof window === "undefined") return;

    const fireDueReminders = async () => {
      const now = Date.now();
      const reminderLedger = readReminderLedger();
      const nextReminder = reminderSlots.find(
        (slot) => slot.scheduledAt.getTime() > now,
      );

      setNextReminderLabel(
        nextReminder
          ? `${formatReminderDateTime(nextReminder.remindAt)} • ${nextReminder.items.join(", ")}`
          : null,
      );

      for (const slot of reminderSlots) {
        if (reminderLedger[slot.id]) continue;

        const remindAt = slot.remindAt.getTime();
        const scheduledAt = slot.scheduledAt.getTime();
        const shouldFireOnTime = now >= remindAt && now < scheduledAt;
        const shouldFireCatchUp =
          now >= scheduledAt && now - scheduledAt <= REMINDER_GRACE_MS;

        if (shouldFireOnTime || shouldFireCatchUp) {
          await showReminderNotification(
            slot.title,
            shouldFireCatchUp
              ? `Baru terlewat: ${slot.items.join(", ")}`
              : slot.body,
            slot.id,
          );
          reminderLedger[slot.id] = now;
          writeReminderLedger(reminderLedger);
        }
      }
    };

    void fireDueReminders();
    const intervalId = window.setInterval(() => {
      void fireDueReminders();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void fireDueReminders();
      }
    };
    const handleFocus = () => {
      void fireDueReminders();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [notificationsEnabled, notificationState, reminderSlots]);

  // ── Handler utama notifikasi ──────────────────────────────
  const handleNotificationClick = async () => {
    if (notificationState === "unsupported") return;

    if (notificationsEnabled) {
      await onNotificationSettingChange(false);
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission);

    if (permission === "granted") {
      // Daftarkan FCM token untuk background push (fire-and-forget)
      try {
        const { requestFcmToken } = await import("@/lib/fcm");
        await requestFcmToken();
      } catch (err) {
        // FCM gagal tidak memblokir notifikasi lokal
        console.warn("[AppActionsCard] FCM token request gagal:", err);
      }

      await onNotificationSettingChange(true);
      return;
    }

    await onNotificationSettingChange(false);
  };

  return (
    <div className="card p-4">
      <button
        onClick={() => setIsReminderExpanded(!isReminderExpanded)}
        className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        style={{ marginBottom: isReminderExpanded ? "12px" : "0" }}
      >
        <div className="flex items-center gap-2">
          <Clock size={13} style={{ color: "var(--text-muted)" }} />
          <span className="section-label">Reminder</span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: "var(--text-muted)",
            transform: isReminderExpanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {isReminderExpanded && (
        <button
          onClick={handleNotificationClick}
          disabled={notificationState === "unsupported"}
          className="w-full rounded-xl px-3 py-3 text-left transition-all disabled:opacity-40"
          style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${notificationsEnabled ? "var(--text-muted)" : "var(--border)"}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            {notificationsEnabled ? (
              <Bell size={14} style={{ color: "var(--text-primary)" }} />
            ) : (
              <BellOff size={14} style={{ color: "var(--text-muted)" }} />
            )}
            <span
              className="text-xs font-display font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {notificationsEnabled ? "Reminder Aktif" : "Aktifkan Reminder"}
            </span>
          </div>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {notificationState === "unsupported"
              ? "Browser tidak mendukung Notification API."
              : notificationsEnabled
                ? nextReminderLabel
                  ? `Berikutnya: ${nextReminderLabel}`
                  : "Tidak ada reminder tersisa hari ini."
                : "Notifikasi 5 menit sebelum jadwal, plus catch-up saat app dibuka kembali."}
          </p>
        </button>
      )}

      {notificationState === "denied" && isReminderExpanded && (
        <div
          className="mt-2 rounded-xl p-2.5 text-[11px] leading-relaxed"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid #3a1a1a",
            color: "var(--danger)",
          }}
        >
          Izin notifikasi diblokir — buka pengaturan site di browser dan ubah ke{" "}
          <strong>Allow</strong>.
        </div>
      )}
    </div>
  );
}
