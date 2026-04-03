"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatReminderDateTime,
  getSupplementReminderSlots,
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
    Object.entries(ledger).filter(([, timestamp]) => Date.now() - timestamp < 3 * 24 * 60 * 60 * 1000),
  );
  localStorage.setItem(REMINDER_LEDGER_KEY, JSON.stringify(pruned));
}

async function showReminderNotification(
  title: string,
  body: string,
  tag: string,
) {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: "/planner" },
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
}: AppActionsCardProps) {
  const [, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
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

  const reminderSlots = useMemo(
    () => getSupplementReminderSlots(dateKey, supplements, fastingContext),
    [dateKey, supplements, fastingContext],
  );

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

  const handleNotificationClick = async () => {
    if (notificationState === "unsupported") return;

    if (notificationsEnabled) {
      await onNotificationSettingChange(false);
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission);

    if (permission === "granted") {
      await onNotificationSettingChange(true);
      return;
    }

    await onNotificationSettingChange(false);
  };

  return (
    <div className="card p-4">
      <button
        onClick={() => setIsReminderExpanded(!isReminderExpanded)}
        className="w-full flex items-center justify-between mb-3 hover:opacity-75 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-jade-400" />
          <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
            Reminder
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-gray-500 transition-transform",
            isReminderExpanded && "rotate-180",
          )}
        />
      </button>

      {isReminderExpanded && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
          <button
            onClick={handleNotificationClick}
            disabled={notificationState === "unsupported"}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-all disabled:opacity-60",
              notificationsEnabled
                ? "bg-indigo-950/40 border-indigo-800/50"
                : "bg-night-800/50 border-night-700/50 hover:border-indigo-700/50",
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {notificationsEnabled ? (
                <Bell size={16} className="text-indigo-300" />
              ) : (
                <BellOff size={16} className="text-indigo-300" />
              )}
              <span className="text-sm font-display font-semibold text-gray-200">
                {notificationsEnabled ? "Reminder Aktif" : "Aktifkan Reminder"}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {notificationState === "unsupported"
                ? "Browser ini tidak mendukung Notification API."
                : notificationsEnabled
                  ? nextReminderLabel
                    ? `Reminder berikutnya: ${nextReminderLabel}`
                    : "Tidak ada reminder tersisa untuk hari ini."
                  : "Notifikasi best-effort akan muncul 5 menit sebelum jadwal, lalu mencoba catch-up sekali saat app dibuka kembali dalam grace window."}
            </p>
          </button>
        </div>
      )}

      {notificationState === "denied" && isReminderExpanded && (
        <div className="mt-3 rounded-2xl border border-red-800/40 bg-red-950/30 p-3 text-xs text-red-300 leading-relaxed">
          Izin notifikasi sedang diblokir. Buka pengaturan site di browser, ubah
          permission notifikasi ke <strong>Allow</strong>, lalu aktifkan
          reminder lagi.
        </div>
      )}
    </div>
  );
}
