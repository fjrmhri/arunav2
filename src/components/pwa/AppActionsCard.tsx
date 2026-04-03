"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatReminderTime,
  getSupplementReminderSlots,
} from "@/lib/supplementReminders";
import type { Supplement } from "@/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface AppActionsCardProps {
  dateKey: string;
  isFastingDay: boolean;
  notificationsEnabled: boolean;
  supplements: Supplement[];
  onNotificationSettingChange: (enabled: boolean) => Promise<void> | void;
}

type NotificationState = NotificationPermission | "unsupported";

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
  isFastingDay,
  notificationsEnabled,
  supplements,
  onNotificationSettingChange,
}: AppActionsCardProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [standaloneMode, setStandaloneMode] = useState(false);
  const [serviceWorkerAktif, setServiceWorkerAktif] = useState(false);
  const [promptInstallTersedia, setPromptInstallTersedia] = useState(false);
  const [isReminderExpanded, setIsReminderExpanded] = useState(true);
  const [notificationState, setNotificationState] =
    useState<NotificationState>("unsupported");
  const [nextReminderLabel, setNextReminderLabel] = useState<string | null>(
    null,
  );

  const reminderSlots = useMemo(
    () => getSupplementReminderSlots(dateKey, supplements, isFastingDay),
    [dateKey, supplements, isFastingDay],
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
        ? `${formatReminderTime(nextReminder.remindAt)} • ${nextReminder.items.join(", ")}`
        : null,
    );
  }, [reminderSlots]);

  useEffect(() => {
    if (!notificationsEnabled || notificationState !== "granted") return;
    if (typeof window === "undefined") return;

    const fireDueReminders = async () => {
      const now = Date.now();
      const nextReminder = reminderSlots.find(
        (slot) => slot.scheduledAt.getTime() > now,
      );

      setNextReminderLabel(
        nextReminder
          ? `${formatReminderTime(nextReminder.remindAt)} • ${nextReminder.items.join(", ")}`
          : null,
      );

      for (const slot of reminderSlots) {
        const storageKey = `supplement_reminder_${slot.id}`;
        if (localStorage.getItem(storageKey)) continue;

        const remindAt = slot.remindAt.getTime();
        const scheduledAt = slot.scheduledAt.getTime();

        if (now >= remindAt && now < scheduledAt) {
          await showReminderNotification(slot.title, slot.body, slot.id);
          localStorage.setItem(storageKey, String(now));
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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
                  : "Notifikasi akan muncul 5 menit sebelum jadwal suplemen."}
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
